import Stripe from "stripe";
import { randomBytes } from "node:crypto";
import { getRedis } from "./redis";
import { getCalBooking } from "./calcom";
import { sendBalanceLinkEmail, sendBalancePaidNotification } from "./email";
import {
  getManualBooking,
  isManualId,
  listManualBookings,
  manualOwed,
  updateManualBooking,
  type ManualBooking,
} from "./manualBookings";

/**
 * Collecting the balance after the deposit.
 *
 * A daily job emails each customer a link to pay what's left, a couple of
 * days before their session. The link points at /pay-balance/<token> on our
 * own site, not at Stripe: a Stripe Checkout session expires within 24 hours,
 * so a link emailed 2 days ahead would be dead by the time it was used. Each
 * click creates a fresh Checkout session, priced on the server from the
 * original deposit session, so the amount can't be changed from outside.
 *
 * If it is still unpaid on the day before the session, the same link goes out
 * once more as a reminder.
 *
 * When that payment lands, the Stripe webhook (and the success page) mark the
 * balance paid via finalizePaidSession, which tells the studio.
 */

export type BalanceStatus = {
  token: string;
  /** Pounds, e.g. "15.00". */
  amount: string;
  linkSentAt?: string;
  reminderSentAt?: string;
  paidAt?: string;
  /** The balance Checkout session, or IN_PERSON when marked paid by the studio. */
  paidSessionId?: string;
  /** Set when the studio refunded a balance paid online. */
  refundedAt?: string;
};

export const IN_PERSON = "in-person";

/** The job runs daily, so the link arrives between 48 and 72 hours before. */
export const BALANCE_LINK_LEAD_HOURS = 72;
/** How far back to look for deposits whose session is still to come. */
const LOOKBACK_DAYS = 120;
/**
 * No reminder within this long of the first link (a booking made the morning
 * before its session gets its link with the confirmation, not two emails).
 */
const REMINDER_MIN_GAP_HOURS = 12;
const KEEP_SECONDS = 60 * 60 * 24 * 180;

const statusKey = (depositSessionId: string) => `balance:status:${depositSessionId}`;
const tokenKey = (token: string) => `balance:token:${token}`;
const TOKEN = /^[A-Za-z0-9_-]{24,64}$/;

const log = (msg: string, ...rest: unknown[]) => console.log(`[BALANCE] ${msg}`, ...rest);

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) throw new Error("Stripe is not configured");
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://www.rtspaces.co.uk").replace(/\/$/, "");
}

export function balancePayUrl(token: string): string {
  return `${baseUrl()}/pay-balance/${token}`;
}

/** Pounds still owed on a deposit session (0 when nothing is owed). */
export function balanceOwed(session: Stripe.Checkout.Session): number {
  const owed = parseFloat(session.metadata?.balanceDue ?? "");
  return Number.isFinite(owed) && owed > 0 ? Math.round(owed * 100) / 100 : 0;
}

/** A paid booking deposit (not a balance payment, not a membership). */
export function isDepositSession(session: Stripe.Checkout.Session): boolean {
  return (
    session.mode === "payment" &&
    session.payment_status === "paid" &&
    session.metadata?.kind !== "balance" &&
    Boolean(session.metadata?.calBookingUid || session.metadata?.sessionStart)
  );
}

export async function getBalanceStatus(depositSessionId: string): Promise<BalanceStatus | null> {
  return getRedis().get<BalanceStatus>(statusKey(depositSessionId));
}

export async function getBalanceStatuses(ids: string[]): Promise<Record<string, BalanceStatus | null>> {
  if (!ids.length) return {};
  const pipeline = getRedis().pipeline();
  for (const id of ids) pipeline.get<BalanceStatus>(statusKey(id));
  const results = await pipeline.exec<(BalanceStatus | null)[]>();
  return Object.fromEntries(ids.map((id, i) => [id, results[i] ?? null]));
}

async function saveStatus(depositSessionId: string, status: BalanceStatus) {
  await getRedis().set(statusKey(depositSessionId), status, { ex: KEEP_SECONDS });
}

/**
 * One booking that may owe a balance: an online deposit (keyed by its Stripe
 * Checkout session id) or a booking the studio added by hand (keyed by its
 * "manual_" id). Everything below works on this, so both kinds get the same
 * links, reminders and admin buttons.
 */
export type BalanceSubject = {
  id: string;
  owed: number;
  email: string | null;
  name: string;
  bookingDate?: string;
  bookingHours?: string;
  packageTitle?: string;
  calBookingUid?: string;
  /** ISO start, when known without asking Cal.com. */
  start?: string;
  /** Known locally to be cancelled. */
  cancelled?: boolean;
};

export function subjectFromSession(session: Stripe.Checkout.Session): BalanceSubject | null {
  if (!isDepositSession(session)) return null;
  const m = session.metadata ?? {};
  return {
    id: session.id,
    owed: balanceOwed(session),
    email: m.customerEmail || session.customer_details?.email || session.customer_email || null,
    name: m.customerName || session.customer_details?.name || "there",
    bookingDate: m.bookingDate,
    bookingHours: m.bookingHours,
    packageTitle: m.packageTitle,
    calBookingUid: m.calBookingUid || undefined,
    start: m.sessionStart || undefined,
  };
}

export function subjectFromManual(b: ManualBooking): BalanceSubject | null {
  if (b.cancelledAt) return null;
  return {
    id: b.id,
    owed: manualOwed(b),
    // Customers who asked not to be emailed never get a link from the job.
    email: b.emailCustomer && b.email ? b.email : null,
    name: b.name || "there",
    bookingDate: b.bookingDate,
    bookingHours: b.bookingHours,
    packageTitle: b.packageTitle,
    calBookingUid: b.calBookingUid,
    start: b.start,
  };
}

/** Look a subject up by id: a manual booking, or a Stripe deposit session. */
export async function loadSubject(id: string): Promise<BalanceSubject | null> {
  if (isManualId(id)) {
    const b = await getManualBooking(id);
    return b ? subjectFromManual(b) : null;
  }
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return null;
  return subjectFromSession(await stripe().checkout.sessions.retrieve(id));
}

/**
 * When the session starts, and whether it is still on. A stored start time
 * is used when there is one; Cal.com is still asked, because it also tells us
 * if the booking was cancelled (a full refund cancels it there).
 */
async function sessionTiming(subject: BalanceSubject): Promise<{ start: string | null; cancelled: boolean }> {
  if (subject.cancelled) return { start: subject.start ?? null, cancelled: true };
  if (subject.calBookingUid) {
    const booking = await getCalBooking(subject.calBookingUid);
    if (booking) {
      return {
        start: subject.start || booking.start,
        cancelled: booking.status === "cancelled" || booking.status === "rejected",
      };
    }
  }
  return { start: subject.start || null, cancelled: false };
}

/** YYYY-MM-DD in UK time, so "tomorrow" means the studio's tomorrow. */
export function londonDay(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(at);
}

function linkEmailData(subject: BalanceSubject, email: string, status: BalanceStatus) {
  return {
    name: subject.name,
    email,
    amount: status.amount,
    payUrl: balancePayUrl(status.token),
    bookingDate: subject.bookingDate,
    bookingHours: subject.bookingHours,
    packageTitle: subject.packageTitle,
  };
}

/**
 * Store a token and email the link. The token is stored before the email
 * goes out, so the link works the moment it lands; linkSentAt is only written
 * after a successful send, so a failed send is simply retried next time.
 */
async function emailLink(subject: BalanceSubject, email: string, existing: BalanceStatus | null, now: Date) {
  const token = existing?.token || randomBytes(24).toString("base64url");
  const status: BalanceStatus = { ...existing, token, amount: subject.owed.toFixed(2) };
  await getRedis().set(tokenKey(token), { depositSessionId: subject.id }, { ex: KEEP_SECONDS });
  await saveStatus(subject.id, status);
  await sendBalanceLinkEmail(linkEmailData(subject, email, status));
  await saveStatus(subject.id, { ...status, linkSentAt: now.toISOString() });
  log("link sent:", subject.id, status.amount);
}

const asSubject = (booking: Stripe.Checkout.Session | BalanceSubject) =>
  "owed" in booking ? booking : subjectFromSession(booking);

/**
 * Email the balance link for one booking if its session is close enough and
 * it hasn't been sent or paid. Safe to call repeatedly. Returns true if sent.
 */
export async function sendBalanceLinkIfDue(
  booking: Stripe.Checkout.Session | BalanceSubject,
  now: Date = new Date()
): Promise<boolean> {
  const subject = asSubject(booking);
  if (!subject?.owed) return false;

  const existing = await getBalanceStatus(subject.id);
  if (existing?.paidAt || existing?.linkSentAt) return false;

  const { start, cancelled } = await sessionTiming(subject);
  if (!start || cancelled) return false;
  const msUntil = Date.parse(start) - now.getTime();
  if (!(msUntil > 0) || msUntil > BALANCE_LINK_LEAD_HOURS * 60 * 60 * 1000) return false;

  if (!subject.email) {
    log("no customer email, cannot send link:", subject.id);
    return false;
  }
  await emailLink(subject, subject.email, existing, now);
  return true;
}

/**
 * The day before the session (UK date), resend the link once if the balance
 * is still unpaid. Safe to call repeatedly. Returns true if sent.
 */
export async function sendBalanceReminderIfDue(
  booking: Stripe.Checkout.Session | BalanceSubject,
  now: Date = new Date()
): Promise<boolean> {
  const subject = asSubject(booking);
  if (!subject?.owed || !subject.email) return false;

  const existing = await getBalanceStatus(subject.id);
  if (!existing?.linkSentAt || existing.paidAt || existing.reminderSentAt || !existing.token) return false;
  if (now.getTime() - Date.parse(existing.linkSentAt) < REMINDER_MIN_GAP_HOURS * 60 * 60 * 1000) return false;

  const { start, cancelled } = await sessionTiming(subject);
  if (!start || cancelled) return false;
  const tomorrow = londonDay(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  if (londonDay(new Date(start)) !== tomorrow) return false;

  await sendBalanceLinkEmail({ ...linkEmailData(subject, subject.email, existing), reminder: true });
  await saveStatus(subject.id, { ...existing, reminderSentAt: now.toISOString() });
  log("reminder sent:", subject.id, existing.amount);
  return true;
}

export type ResendResult = "sent" | "paid" | "nothing_owed" | "no_email" | "not_found";

/**
 * The admin "Send link" button: email the link now, whatever the timing.
 * Goes to `toEmail` when given (say, a manual booking whose customer was not
 * emailed before), otherwise to the customer's address on the booking.
 */
export async function resendBalanceLink(id: string, now: Date = new Date(), toEmail?: string): Promise<ResendResult> {
  const subject = await loadSubject(id);
  if (!subject) return "not_found";
  const existing = await getBalanceStatus(id);
  if (existing?.paidAt) return "paid";
  if (!subject.owed) return "nothing_owed";
  const manual = isManualId(id) ? await getManualBooking(id) : null;
  const email = toEmail || subject.email || manual?.email;
  if (!email) return "no_email";
  await emailLink(subject, email, existing, now);
  return "sent";
}

/** Daily job: send every balance link and day-before reminder that has come due. */
export async function sendDueBalanceLinks(
  now: Date = new Date()
): Promise<{ checked: number; sent: number; reminded: number; failed: number }> {
  const sessions = await stripe()
    .checkout.sessions.list({
      created: { gte: Math.floor(now.getTime() / 1000) - LOOKBACK_DAYS * 24 * 60 * 60 },
      limit: 100,
    })
    .autoPagingToArray({ limit: 2000 });
  const manual = await listManualBookings(now, new Date(now.getTime() + (BALANCE_LINK_LEAD_HOURS + 24) * 3600_000));

  const subjects = [...sessions.map(subjectFromSession), ...manual.map(subjectFromManual)].filter(
    (s): s is BalanceSubject => Boolean(s)
  );

  let sent = 0;
  let reminded = 0;
  let failed = 0;
  for (const subject of subjects) {
    try {
      if (await sendBalanceLinkIfDue(subject, now)) sent++;
      else if (await sendBalanceReminderIfDue(subject, now)) reminded++;
    } catch (error) {
      failed++;
      console.error("[BALANCE] could not send link:", subject.id, error);
    }
  }
  return { checked: subjects.length, sent, reminded, failed };
}

export type BalanceCheckout =
  | { kind: "redirect"; url: string }
  | { kind: "already_paid" }
  | { kind: "nothing_owed" }
  | { kind: "not_found" };

/** Behind /pay-balance/<token>: a fresh Checkout session for what is owed. */
export async function createBalanceCheckout(token: string): Promise<BalanceCheckout> {
  if (!TOKEN.test(token)) return { kind: "not_found" };
  const link = await getRedis().get<{ depositSessionId: string }>(tokenKey(token));
  if (!link) return { kind: "not_found" };

  const status = await getBalanceStatus(link.depositSessionId);
  if (status?.paidAt) return { kind: "already_paid" };

  const subject = await loadSubject(link.depositSessionId);
  if (!subject) return { kind: "not_found" };
  if (!subject.owed) return { kind: "nothing_owed" };

  // A manual booking's customer may only have the address the link went to.
  const manual = isManualId(subject.id) ? await getManualBooking(subject.id) : null;
  const email = subject.email || manual?.email || undefined;
  const when = [subject.bookingDate, subject.bookingHours].filter(Boolean).join(", ");
  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Balance: ${subject.packageTitle || "Studio booking"}`,
            description: (when ? `Remaining balance for ${when}` : "Remaining balance").slice(0, 500),
          },
          unit_amount: Math.round(subject.owed * 100),
        },
        quantity: 1,
      },
    ],
    ...(email ? { customer_email: email } : {}),
    success_url: `${baseUrl()}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/pay-balance/${token}`,
    metadata: {
      kind: "balance",
      depositSessionId: subject.id,
      customerName: subject.name,
      customerEmail: email || "",
      bookingDate: subject.bookingDate || "",
      bookingHours: subject.bookingHours || "",
      packageTitle: subject.packageTitle || "",
      balanceAmount: subject.owed.toFixed(2),
    },
  });
  if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
  return { kind: "redirect", url: checkout.url };
}

/**
 * A balance Checkout session has been paid: record it and tell the studio.
 * Called from finalizePaidSession, which provides the per-session idempotency.
 */
export async function recordBalancePaid(session: Stripe.Checkout.Session, stripeUrl?: string) {
  const meta = session.metadata ?? {};
  const depositSessionId = meta.depositSessionId;
  if (!depositSessionId) throw new Error(`balance session ${session.id} has no deposit reference`);

  const amount = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : meta.balanceAmount || "0.00";
  const paidAt = new Date().toISOString();
  const existing = await getBalanceStatus(depositSessionId);
  await saveStatus(depositSessionId, {
    token: existing?.token ?? "",
    amount,
    linkSentAt: existing?.linkSentAt,
    reminderSentAt: existing?.reminderSentAt,
    paidAt,
    paidSessionId: session.id,
  });
  if (isManualId(depositSessionId)) await updateManualBooking(depositSessionId, { paidInFullAt: paidAt });
  log("paid:", depositSessionId, amount);

  return {
    notify: () =>
      sendBalancePaidNotification({
        name: meta.customerName || session.customer_details?.name || "Customer",
        email: meta.customerEmail || session.customer_details?.email || "",
        amount,
        bookingDate: meta.bookingDate || undefined,
        bookingHours: meta.bookingHours || undefined,
        packageTitle: meta.packageTitle || undefined,
        stripeUrl,
      }),
  };
}

/** The admin "Mark paid" button: the balance was paid in person. */
export async function markBalancePaidInPerson(id: string, now: Date = new Date()): Promise<boolean> {
  const subject = await loadSubject(id);
  if (!subject) return false;
  const existing = await getBalanceStatus(id);
  await saveStatus(id, {
    ...existing,
    token: existing?.token ?? "",
    amount: subject.owed.toFixed(2),
    paidAt: now.toISOString(),
    paidSessionId: IN_PERSON,
  });
  if (isManualId(id)) await updateManualBooking(id, { paidInFullAt: now.toISOString() });
  log("marked paid in person:", id);
  return true;
}

/** After the admin refunds a balance paid online, it is owed again. */
export async function recordBalanceRefunded(id: string, now: Date = new Date()): Promise<void> {
  const existing = await getBalanceStatus(id);
  if (!existing) return;
  await saveStatus(id, { ...existing, paidAt: undefined, paidSessionId: undefined, refundedAt: now.toISOString() });
}
