import Stripe from "stripe";
import { getRedis } from "@/lib/redis";
import { cancelCalBooking, confirmCalBooking, createCalBooking, getEventTypeId } from "@/lib/calcom";
import { getMergedPackages } from "@/lib/admin/pricing-merged";
import { getPackagePriceForBooking } from "@/lib/pricing";
import {
  getBalanceStatus,
  IN_PERSON,
  markBalancePaidInPerson,
  recordBalanceRefunded,
  resendBalanceLink,
  sendBalanceLinkIfDue,
  subjectFromManual,
} from "@/lib/balance";
import {
  getManualBooking,
  isManualId,
  newManualId,
  saveManualBooking,
  updateManualBooking,
  type ManualBooking,
} from "@/lib/manualBookings";
import { sendManualBookingConfirmation } from "@/lib/email";

/**
 * What the admin buttons on /admin/bookings do. Every function here is
 * reached only through /api/admin/*, which proxy.ts keeps behind the admin
 * login.
 */

export class ActionError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const log = (msg: string, ...rest: unknown[]) => console.log(`[ADMIN] ${msg}`, ...rest);

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) throw new ActionError("Stripe is not configured", 500);
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "full" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit" });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Cancelled online bookings ───────────────────────────────────────────────
// Stripe has nowhere to record that the studio cancelled a booking, so it is
// kept here for the admin table. Cal.com is still the source of truth for
// whether the slot is free.

const cancelledKey = (id: string) => `admin:cancelled:${id}`;

export async function getCancelledFlags(ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const pipeline = getRedis().pipeline();
  for (const id of ids) pipeline.get<string>(cancelledKey(id));
  const results = await pipeline.exec<(string | null)[]>();
  return new Set(ids.filter((_, i) => results[i]));
}

async function flagCancelled(id: string) {
  await getRedis().set(cancelledKey(id), new Date().toISOString(), { ex: 60 * 60 * 24 * 400 });
}

// ── Manual bookings ─────────────────────────────────────────────────────────

export type ManualBookingInput = {
  packageId: string;
  start: string;
  /** Hourly-hire packages only: how many hours. */
  hours?: number;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  totalPrice: number;
  paidUpfront: number;
  emailCustomer: boolean;
};

function money(value: unknown, label: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 10000) throw new ActionError(`${label} must be between £0 and £10,000`);
  return Math.round(n * 100) / 100;
}

/** Check and tidy what the form sent. */
export function parseManualBookingInput(body: Record<string, unknown>): ManualBookingInput {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const input: ManualBookingInput = {
    packageId: str(body.packageId, 60),
    start: str(body.start, 40),
    hours: body.hours == null || body.hours === "" ? undefined : Number(body.hours),
    name: str(body.name, 100),
    email: str(body.email, 200).toLowerCase(),
    phone: str(body.phone, 40),
    notes: str(body.notes, 500),
    totalPrice: money(body.totalPrice, "Total"),
    paidUpfront: money(body.paidUpfront ?? 0, "Amount paid"),
    emailCustomer: body.emailCustomer !== false,
  };
  if (!input.packageId) throw new ActionError("Choose a package");
  if (!input.start || Number.isNaN(Date.parse(input.start))) throw new ActionError("Choose a time");
  if (Date.parse(input.start) < Date.now() - 60 * 60 * 1000) throw new ActionError("That time has already passed");
  if (!input.name) throw new ActionError("Enter the customer's name");
  if (input.email && !EMAIL.test(input.email)) throw new ActionError("That email address doesn't look right");
  if (input.emailCustomer && !input.email) throw new ActionError("Add an email address, or untick 'Email the customer'");
  if (input.paidUpfront > input.totalPrice) throw new ActionError("Amount paid can't be more than the total");
  if (input.hours != null && (!Number.isInteger(input.hours) || input.hours < 1 || input.hours > 12)) {
    throw new ActionError("Hours must be a whole number from 1 to 12");
  }
  return input;
}

/** The package's normal price for a time, to pre-fill the form. */
export async function quotePrice(packageId: string, start: string, hours?: number) {
  const pkg = (await getMergedPackages()).find((p) => p.id === packageId);
  if (!pkg) throw new ActionError("Unknown package");
  const minutes = pkg.priceFromTime ? (hours ?? pkg.minimumHours ?? 2) * 60 : pkg.hours * 60;
  const end = new Date(Date.parse(start) + minutes * 60_000).toISOString();
  return { price: getPackagePriceForBooking(pkg, start, end), minutes };
}

export async function createManualBooking(input: ManualBookingInput) {
  const pkg = (await getMergedPackages()).find((p) => p.id === input.packageId);
  if (!pkg) throw new ActionError("Unknown package");
  const eventTypeId = await getEventTypeId(pkg.id);
  if (!eventTypeId) throw new ActionError("That package has no Cal.com event type", 500);

  const hours = pkg.priceFromTime ? input.hours ?? pkg.minimumHours ?? 2 : pkg.hours;
  // Cal.com emails its attendee. With no customer email, that goes to the studio.
  const attendeeEmail = input.email || process.env.STUDIO_EMAIL || "enquires@rtspaces.co.uk";
  const calNotes = ["Added by the studio in the admin portal.", input.phone && `Phone: ${input.phone}`, input.notes]
    .filter(Boolean)
    .join("\n");

  let created;
  try {
    created = await createCalBooking({
      eventTypeId,
      start: input.start,
      name: input.name,
      email: attendeeEmail,
      notes: calNotes,
      ...(pkg.priceFromTime ? { lengthInMinutes: hours * 60 } : {}),
    });
  } catch (error) {
    console.error("[ADMIN] Cal.com refused the manual booking:", error);
    throw new ActionError("Cal.com wouldn't take that time. It may have just been booked, or be too soon: pick another.", 409);
  }

  // Event types require confirmation; a manual booking is confirmed at once.
  if (created.status !== "accepted" && !(await confirmCalBooking(created.uid))) {
    await cancelCalBooking(created.uid, "Could not confirm a booking added by the studio");
    throw new ActionError("Cal.com took the booking but wouldn't confirm it, so it was cancelled. Try again.", 502);
  }

  const start = created.start || input.start;
  const end = created.end || new Date(Date.parse(start) + hours * 3600_000).toISOString();
  const booking: ManualBooking = {
    id: newManualId(),
    calBookingUid: created.uid,
    name: input.name,
    email: input.email ?? "",
    phone: input.phone ?? "",
    notes: input.notes ?? "",
    packageId: pkg.id,
    packageTitle: pkg.title,
    start,
    end,
    bookingDate: dateFmt.format(new Date(start)),
    bookingHours: `${timeFmt.format(new Date(start))} – ${timeFmt.format(new Date(end))}`,
    totalPrice: input.totalPrice,
    paidUpfront: input.paidUpfront,
    emailCustomer: input.emailCustomer,
    createdAt: new Date().toISOString(),
    ...(input.paidUpfront >= input.totalPrice ? { paidInFullAt: new Date().toISOString() } : {}),
  };
  await saveManualBooking(booking);
  log("manual booking added:", booking.id, booking.calBookingUid);

  // The booking stands even if an email fails; tell the studio instead.
  const warnings: string[] = [];
  if (booking.emailCustomer && booking.email) {
    try {
      await sendManualBookingConfirmation({
        name: booking.name,
        email: booking.email,
        amount: Math.max(0, booking.totalPrice - booking.paidUpfront).toFixed(2),
        totalPrice: booking.totalPrice.toFixed(2),
        paidUpfront: booking.paidUpfront.toFixed(2),
        bookingDate: booking.bookingDate,
        bookingHours: booking.bookingHours,
        packageTitle: booking.packageTitle,
      });
      // Inside the 3-day window the balance link goes out straight away.
      const subject = subjectFromManual(booking);
      if (subject) await sendBalanceLinkIfDue(subject);
    } catch (error) {
      console.error("[ADMIN] manual booking email failed:", booking.id, error);
      warnings.push("The booking is saved, but the confirmation email didn't send.");
    }
  }
  return { booking, warnings };
}

// ── Row buttons ─────────────────────────────────────────────────────────────

export async function sendLinkNow(id: string, toEmail?: string): Promise<string> {
  if (toEmail && !EMAIL.test(toEmail)) throw new ActionError("That email address doesn't look right");
  const result = await resendBalanceLink(id, new Date(), toEmail);
  const messages: Record<typeof result, string> = {
    sent: "Payment link sent.",
    paid: "The balance is already paid.",
    nothing_owed: "There's nothing left to pay on this booking.",
    no_email: "This booking has no email address. Enter one to send the link to.",
    not_found: "Booking not found.",
  };
  if (result !== "sent") throw new ActionError(messages[result], result === "not_found" ? 404 : 400);
  return messages.sent;
}

export async function markPaid(id: string): Promise<string> {
  if (!(await markBalancePaidInPerson(id))) throw new ActionError("Booking not found", 404);
  return "Marked as paid in full.";
}

async function onlineSession(id: string) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) throw new ActionError("Booking not found", 404);
  const session = await stripe().checkout.sessions.retrieve(id);
  if (session.payment_status !== "paid" || session.metadata?.kind === "balance") {
    throw new ActionError("Booking not found", 404);
  }
  return session;
}

const calUids = (meta: Stripe.Metadata | null) =>
  (meta?.calBookingUids || meta?.calBookingUid || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

/** Cancel without refunding (deposits are non-refundable): frees the slot. */
export async function cancelBooking(id: string): Promise<string> {
  if (isManualId(id)) {
    const booking = await getManualBooking(id);
    if (!booking) throw new ActionError("Booking not found", 404);
    if (booking.cancelledAt) return "Already cancelled.";
    if (!(await cancelCalBooking(booking.calBookingUid, "Cancelled by the studio"))) {
      throw new ActionError("Cal.com wouldn't cancel it. Check the booking in Cal.com.", 502);
    }
    await updateManualBooking(id, { cancelledAt: new Date().toISOString() });
    log("manual booking cancelled:", id);
    return "Cancelled. The slot is free again.";
  }

  const session = await onlineSession(id);
  const uids = calUids(session.metadata);
  const results = await Promise.all(uids.map((uid) => cancelCalBooking(uid, "Cancelled by the studio")));
  await flagCancelled(id);
  log("online booking cancelled:", id);
  if (results.some((ok) => !ok)) return "Marked cancelled, but Cal.com didn't confirm the cancellation. Check it in Cal.com.";
  return "Cancelled. The slot is free again. Nothing was refunded.";
}

export type RefundScope = "balance" | "deposit" | "all";

/**
 * Refund an online booking through Stripe. Refunding the deposit cancels the
 * booking (the charge.refunded webhook frees the slot in Cal.com, and it is
 * done here too so the table updates at once). Refunding only the balance
 * keeps the booking, and the balance shows as owed again.
 */
export async function refundBooking(id: string, scope: RefundScope): Promise<string> {
  if (isManualId(id)) throw new ActionError("Manual bookings were paid in person: refund them the same way.");
  const session = await onlineSession(id);
  const s = stripe();
  const done: string[] = [];

  if (scope === "balance" || scope === "all") {
    const status = await getBalanceStatus(id);
    if (!status?.paidAt || !status.paidSessionId) {
      if (scope === "balance") throw new ActionError("There's no balance payment to refund.");
    } else if (status.paidSessionId === IN_PERSON) {
      if (scope === "balance") throw new ActionError("The balance was paid in person, so refund it in person.");
    } else {
      const balanceSession = await s.checkout.sessions.retrieve(status.paidSessionId);
      const intent =
        typeof balanceSession.payment_intent === "string" ? balanceSession.payment_intent : balanceSession.payment_intent?.id;
      if (!intent) throw new ActionError("Couldn't find the balance payment in Stripe.", 502);
      await s.refunds.create({ payment_intent: intent, reason: "requested_by_customer" });
      await recordBalanceRefunded(id);
      done.push(`balance £${status.amount}`);
    }
  }

  if (scope === "deposit" || scope === "all") {
    const intent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!intent) throw new ActionError("Couldn't find the deposit payment in Stripe.", 502);
    await s.refunds.create({ payment_intent: intent, reason: "requested_by_customer" });
    await Promise.all(calUids(session.metadata).map((uid) => cancelCalBooking(uid, "Payment refunded")));
    await flagCancelled(id);
    done.push(`deposit £${((session.amount_total ?? 0) / 100).toFixed(2)}`);
  }

  log("refunded:", id, done.join(", "));
  if (!done.length) throw new ActionError("Nothing to refund.");
  return `Refunded ${done.join(" and ")}.${scope !== "balance" ? " The booking is cancelled and the slot is free." : ""}`;
}
