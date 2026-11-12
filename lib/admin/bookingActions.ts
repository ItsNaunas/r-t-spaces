import Stripe from "stripe";
import { getRedis } from "@/lib/redis";
import {
  cancelCalBooking,
  confirmCalBooking,
  createCalBooking,
  getCalBooking,
  getEventTypeId,
  rescheduleCalBooking,
} from "@/lib/calcom";
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
import { sendBookingMovedEmail, sendManualBookingConfirmation } from "@/lib/email";
import { restoreVoucher } from "@/lib/vouchers";
import { logActivity } from "@/lib/activity";
import { chargeExtra as createExtraCharge, markExtraPaidInPerson } from "@/lib/extras";
import { markStudioMove, recordMove, resolveCalUid, resolveCalUids, displayTimes } from "@/lib/calMoves";
import { addNoShow, removeNoShow } from "@/lib/customerNotes";

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
  await logActivity({
    action: "booking.add",
    summary: `Added a booking for ${booking.name}: ${booking.packageTitle}, ${booking.bookingDate} ${booking.bookingHours} (£${booking.totalPrice.toFixed(2)}, £${booking.paidUpfront.toFixed(2)} paid)`,
    ref: booking.id,
    amount: booking.paidUpfront,
  });

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
  await logActivity({ action: "balance.link", summary: `Sent a balance payment link${toEmail ? ` to ${toEmail}` : ""}`, ref: id });
  return messages.sent;
}

export async function markPaid(id: string): Promise<string> {
  const owedBefore = (await getBalanceStatus(id))?.amount;
  if (!(await markBalancePaidInPerson(id))) throw new ActionError("Booking not found", 404);
  await logActivity({
    action: "balance.paid_in_person",
    summary: "Marked the balance paid in person",
    ref: id,
    amount: Number(owedBefore) || undefined,
  });
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
    await logActivity({ action: "booking.cancel", summary: `Cancelled ${booking.name}'s booking (${booking.bookingDate})`, ref: id });
    return "Cancelled. The slot is free again.";
  }

  const session = await onlineSession(id);
  const uids = await resolveCalUids(calUids(session.metadata));
  const results = await Promise.all(uids.map((uid) => cancelCalBooking(uid, "Cancelled by the studio")));
  await flagCancelled(id);
  log("online booking cancelled:", id);
  await logActivity({
    action: "booking.cancel",
    summary: `Cancelled ${session.metadata?.customerName ?? "a customer"}'s booking without refund (${session.metadata?.bookingDate ?? ""})`,
    ref: id,
  });
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
  let refunded = 0;

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
      refunded += Number(status.amount) || 0;
    }
  }

  if (scope === "deposit" || scope === "all") {
    const intent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!intent) throw new ActionError("Couldn't find the deposit payment in Stripe.", 502);
    await s.refunds.create({ payment_intent: intent, reason: "requested_by_customer" });
    await Promise.all((await resolveCalUids(calUids(session.metadata))).map((uid) => cancelCalBooking(uid, "Payment refunded")));
    await flagCancelled(id);
    // A voucher that paid part of it gets that amount back on the code.
    if (session.metadata?.voucherCode) {
      const back = await restoreVoucher(session.metadata.voucherCode, session.id);
      if (back) done.push(`£${(back / 100).toFixed(2)} back on voucher ${session.metadata.voucherCode}`);
    }
    done.push(`deposit £${((session.amount_total ?? 0) / 100).toFixed(2)}`);
    refunded += (session.amount_total ?? 0) / 100;
  }

  log("refunded:", id, done.join(", "));
  if (done.length) {
    await logActivity({
      action: "refund",
      summary: `Refunded ${done.join(" and ")} to ${session.metadata?.customerName ?? "a customer"}${scope !== "balance" ? " and cancelled the booking" : ""}`,
      ref: id,
      amount: refunded,
    });
  }
  if (!done.length) throw new ActionError("Nothing to refund.");
  return `Refunded ${done.join(" and ")}.${scope !== "balance" ? " The booking is cancelled and the slot is free." : ""}`;
}

// ── Extras, moving, no-shows ────────────────────────────────────────────────

export async function chargeExtraOnBooking(
  id: string,
  body: { amount?: unknown; reason?: unknown; paidInPerson?: unknown; email?: unknown }
): Promise<string> {
  const amount = money(body.amount, "Amount");
  if (amount < 1) throw new ActionError("Amount must be at least £1");
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 120) : "";
  if (!reason) throw new ActionError("Say what the charge is for");
  const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : undefined;
  if (email && !EMAIL.test(email)) throw new ActionError("That email address doesn't look right");
  const inPerson = body.paidInPerson === true;
  try {
    const { message } = await createExtraCharge(id, { amount, reason, paidInPerson: inPerson, email });
    await logActivity({
      action: inPerson ? "extra.paid_in_person" : "extra.link",
      summary: `${inPerson ? "Recorded" : "Charged"} £${amount.toFixed(2)} for ${reason}${inPerson ? " (paid in person)" : ""}`,
      ref: id,
      amount,
    });
    return message;
  } catch (error) {
    if (error instanceof Error && /not found|no email/i.test(error.message)) throw new ActionError(error.message);
    throw error;
  }
}

export async function markExtraPaid(extraId: string): Promise<string> {
  const extra = await markExtraPaidInPerson(extraId);
  if (!extra) throw new ActionError("Charge not found", 404);
  await logActivity({
    action: "extra.paid_in_person",
    summary: `Marked £${extra.amount.toFixed(2)} for ${extra.reason} paid in person`,
    ref: extra.bookingId,
    amount: extra.amount,
  });
  return "Marked as paid.";
}

/** The booking's current Cal.com booking, package and length, for moving it. */
export async function bookingCalInfo(id: string) {
  let uid: string;
  let packageId: string;
  let name = "";
  let email = "";
  let packageTitle = "";
  if (isManualId(id)) {
    const b = await getManualBooking(id);
    if (!b || b.cancelledAt) throw new ActionError("Booking not found", 404);
    uid = b.calBookingUid;
    packageId = b.packageId;
    name = b.name;
    email = b.emailCustomer ? b.email : "";
    packageTitle = b.packageTitle;
  } else {
    const session = await onlineSession(id);
    const uids = calUids(session.metadata);
    if (uids.length !== 1) throw new ActionError("Block bookings can't be moved here. Move each day in Cal.com.");
    uid = uids[0];
    packageId = session.metadata?.selectedPackage ?? "";
    name = session.metadata?.customerName ?? "";
    email = session.metadata?.customerEmail ?? session.customer_details?.email ?? "";
    packageTitle = session.metadata?.packageTitle ?? "";
  }
  const current = (await resolveCalUid(uid)).uid;
  const booking = await getCalBooking(current);
  if (!booking || booking.status === "cancelled" || booking.status === "rejected") {
    throw new ActionError("That booking is cancelled in Cal.com.");
  }
  const minutes = Math.round((Date.parse(booking.end) - Date.parse(booking.start)) / 60000);
  return { uid: current, booking, packageId, minutes, name, email, packageTitle };
}

export async function moveBooking(id: string, newStart: string): Promise<string> {
  if (!newStart || Number.isNaN(Date.parse(newStart))) throw new ActionError("Choose a new time");
  if (Date.parse(newStart) < Date.now()) throw new ActionError("That time has already passed");
  const info = await bookingCalInfo(id);
  if (Date.parse(info.booking.start) === Date.parse(newStart)) throw new ActionError("That's the time it's already booked for");

  // Cal.com's webhook for this move may arrive before we record it below.
  await markStudioMove(info.uid);
  let moved;
  try {
    moved = await rescheduleCalBooking(info.uid, newStart, "Moved by the studio");
  } catch (error) {
    console.error("[ADMIN] Cal.com refused the move:", error);
    throw new ActionError("Cal.com wouldn't move it to that time. It may have just been taken: pick another.", 409);
  }
  const end = moved.end || new Date(Date.parse(moved.start) + info.minutes * 60000).toISOString();
  await recordMove(info.uid, { newUid: moved.uid, start: moved.start, end, by: "studio" });
  if (isManualId(id)) {
    const b = await getManualBooking(id);
    if (b) await saveManualBooking({ ...b, calBookingUid: moved.uid, start: moved.start, end, ...displayTimes(moved.start, end) });
  }
  if (moved.status === "pending" && !(await confirmCalBooking(moved.uid))) {
    throw new ActionError("Moved in Cal.com, but the new time is unconfirmed. Confirm it in Cal.com.", 502);
  }

  const was = displayTimes(info.booking.start, info.booking.end);
  const now = displayTimes(moved.start, end);
  await logActivity({
    action: "booking.move",
    summary: `Moved ${info.name || "a booking"} from ${was.bookingDate} ${was.bookingHours} to ${now.bookingDate} ${now.bookingHours}`,
    ref: id,
  });

  if (info.email) {
    try {
      await sendBookingMovedEmail({
        name: info.name || "there",
        email: info.email,
        packageTitle: info.packageTitle,
        oldWhen: `${was.bookingDate}, ${was.bookingHours}`,
        newWhen: `${now.bookingDate}, ${now.bookingHours}`,
      });
    } catch (error) {
      console.error("[ADMIN] move email failed:", id, error);
      return `Moved to ${now.bookingDate}, ${now.bookingHours}, but the email to the customer didn't send.`;
    }
  }
  return `Moved to ${now.bookingDate}, ${now.bookingHours}.${info.email ? " The customer has been emailed." : ""}`;
}

/** Mark (or unmark) a past booking as a no-show. */
export async function setNoShow(id: string, noShow: boolean): Promise<string> {
  let email = "";
  let start: string | null = null;
  let name = "";
  let when = "";
  if (isManualId(id)) {
    const b = await getManualBooking(id);
    if (!b) throw new ActionError("Booking not found", 404);
    email = b.email;
    start = b.start;
    name = b.name;
    when = b.bookingDate;
  } else {
    const session = await onlineSession(id);
    email = session.metadata?.customerEmail ?? session.customer_details?.email ?? "";
    const uid = calUids(session.metadata)[0];
    const booking = uid ? await getCalBooking((await resolveCalUid(uid)).uid) : null;
    start = booking?.start ?? session.metadata?.sessionStart ?? null;
    name = session.metadata?.customerName ?? "";
    when = session.metadata?.bookingDate ?? "";
  }
  if (!email) throw new ActionError("This booking has no email address to flag.");
  if (noShow && start && Date.parse(start) > Date.now()) {
    throw new ActionError("You can only mark a no-show once the session has started.");
  }
  if (noShow) await addNoShow(email, id, when);
  else await removeNoShow(email, id);
  await logActivity({
    action: noShow ? "customer.no_show" : "customer.no_show_undo",
    summary: `${noShow ? "Marked" : "Unmarked"} ${name || email} as a no-show (${when})`,
    ref: id,
  });
  return noShow ? "Marked as a no-show. They'll be flagged if they book again." : "No-show removed.";
}
