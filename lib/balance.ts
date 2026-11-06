import Stripe from "stripe";
import { randomBytes } from "node:crypto";
import { getRedis } from "./redis";
import { getCalBooking } from "./calcom";
import { sendBalanceLinkEmail, sendBalancePaidNotification } from "./email";

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
 * When that payment lands, the Stripe webhook (and the success page) mark the
 * balance paid via finalizePaidSession, which tells the studio.
 */

export type BalanceStatus = {
  token: string;
  /** Pounds, e.g. "15.00". */
  amount: string;
  linkSentAt?: string;
  paidAt?: string;
  paidSessionId?: string;
};

/** The job runs daily, so the link arrives between 48 and 72 hours before. */
export const BALANCE_LINK_LEAD_HOURS = 72;
/** How far back to look for deposits whose session is still to come. */
const LOOKBACK_DAYS = 120;
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
 * When the session starts, and whether it is still on. Newer deposits carry
 * the start time in metadata; older ones are looked up in Cal.com, which also
 * tells us if the booking was cancelled (a full refund cancels it there).
 */
async function sessionTiming(session: Stripe.Checkout.Session): Promise<{ start: string | null; cancelled: boolean }> {
  const uid = session.metadata?.calBookingUid;
  if (uid) {
    const booking = await getCalBooking(uid);
    if (booking) {
      return {
        start: session.metadata?.sessionStart || booking.start,
        cancelled: booking.status === "cancelled" || booking.status === "rejected",
      };
    }
  }
  return { start: session.metadata?.sessionStart || null, cancelled: false };
}

/**
 * Email the balance link for one deposit if its session is close enough and
 * it hasn't been sent or paid. Safe to call repeatedly. Returns true if sent.
 */
export async function sendBalanceLinkIfDue(
  session: Stripe.Checkout.Session,
  now: Date = new Date()
): Promise<boolean> {
  if (!isDepositSession(session)) return false;
  const owed = balanceOwed(session);
  if (!owed) return false;

  const existing = await getBalanceStatus(session.id);
  if (existing?.paidAt || existing?.linkSentAt) return false;

  const { start, cancelled } = await sessionTiming(session);
  if (!start || cancelled) return false;
  const msUntil = Date.parse(start) - now.getTime();
  if (!(msUntil > 0) || msUntil > BALANCE_LINK_LEAD_HOURS * 60 * 60 * 1000) return false;

  const email = session.metadata?.customerEmail || session.customer_details?.email || session.customer_email;
  if (!email) {
    log("no customer email on deposit, cannot send link:", session.id);
    return false;
  }

  // The token is stored before the email goes out, so the link works the
  // moment it lands. linkSentAt is only written after a successful send, so a
  // failed send is simply retried on the next run.
  const token = existing?.token ?? randomBytes(24).toString("base64url");
  const status: BalanceStatus = { token, amount: owed.toFixed(2) };
  await getRedis().set(tokenKey(token), { depositSessionId: session.id }, { ex: KEEP_SECONDS });
  await saveStatus(session.id, status);

  await sendBalanceLinkEmail({
    name: session.metadata?.customerName || session.customer_details?.name || "there",
    email,
    amount: status.amount,
    payUrl: balancePayUrl(token),
    bookingDate: session.metadata?.bookingDate,
    bookingHours: session.metadata?.bookingHours,
    packageTitle: session.metadata?.packageTitle,
  });
  await saveStatus(session.id, { ...status, linkSentAt: now.toISOString() });
  log("link sent:", session.id, status.amount);
  return true;
}

/** Daily job: send every balance link that has come due. */
export async function sendDueBalanceLinks(now: Date = new Date()): Promise<{ checked: number; sent: number; failed: number }> {
  const sessions = await stripe()
    .checkout.sessions.list({
      created: { gte: Math.floor(now.getTime() / 1000) - LOOKBACK_DAYS * 24 * 60 * 60 },
      limit: 100,
    })
    .autoPagingToArray({ limit: 2000 });

  let sent = 0;
  let failed = 0;
  const deposits = sessions.filter(isDepositSession);
  for (const session of deposits) {
    try {
      if (await sendBalanceLinkIfDue(session, now)) sent++;
    } catch (error) {
      failed++;
      console.error("[BALANCE] could not send link:", session.id, error);
    }
  }
  return { checked: deposits.length, sent, failed };
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

  const s = stripe();
  const deposit = await s.checkout.sessions.retrieve(link.depositSessionId);
  if (!isDepositSession(deposit)) return { kind: "not_found" };
  const owed = balanceOwed(deposit);
  if (!owed) return { kind: "nothing_owed" };

  const meta = deposit.metadata ?? {};
  const email = meta.customerEmail || deposit.customer_details?.email || deposit.customer_email || undefined;
  const when = [meta.bookingDate, meta.bookingHours].filter(Boolean).join(", ");
  const checkout = await s.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Balance: ${meta.packageTitle || "Studio booking"}`,
            description: (when ? `Remaining balance for ${when}` : "Remaining balance").slice(0, 500),
          },
          unit_amount: Math.round(owed * 100),
        },
        quantity: 1,
      },
    ],
    ...(email ? { customer_email: email } : {}),
    success_url: `${baseUrl()}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/pay-balance/${token}`,
    metadata: {
      kind: "balance",
      depositSessionId: deposit.id,
      customerName: meta.customerName || "",
      customerEmail: email || "",
      bookingDate: meta.bookingDate || "",
      bookingHours: meta.bookingHours || "",
      packageTitle: meta.packageTitle || "",
      balanceAmount: owed.toFixed(2),
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
  const existing = await getBalanceStatus(depositSessionId);
  await saveStatus(depositSessionId, {
    token: existing?.token ?? "",
    amount,
    linkSentAt: existing?.linkSentAt,
    paidAt: new Date().toISOString(),
    paidSessionId: session.id,
  });
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
