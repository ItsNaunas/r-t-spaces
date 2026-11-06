import type Stripe from "stripe";
import { getRedis } from "./redis";
import { saveBooking } from "./bookingStore";
import { confirmCalBooking, getCalBooking } from "./calcom";
import { sendBookingNotification, sendMembershipNotification } from "./email";
import {
  getPendingBooking,
  getPendingBookingByStripeSession,
  confirmPendingBooking,
  allCalUids,
} from "./pendingBookings";
import { MEMBERSHIP_TIERS } from "./membership";
import { recordBalancePaid, sendBalanceLinkIfDue } from "./balance";

/**
 * Turns a paid Stripe Checkout session into a real booking (or membership).
 *
 * Called from the Stripe webhook AND from the success page the customer lands
 * on, so a webhook that never arrives can no longer lose a paid booking. Both
 * callers can run at once, so the work is idempotent per *session*:
 *
 *  - a short lock stops two callers working on the same session at once;
 *  - the "done" record is written only after everything succeeded, so a crash
 *    halfway leaves nothing behind and the next caller (a Stripe retry, or the
 *    customer refreshing) simply finishes the job;
 *  - each side effect that must not repeat (saving, discount count, emails)
 *    has its own marker, so a retry after a partial run doesn't repeat it.
 *
 * Throws on infrastructure errors (Redis down): the webhook turns that into a
 * 500 so Stripe retries.
 */

export type FinalizeResult =
  | { status: "not_paid" }
  | { status: "busy" }
  | {
      status: "done";
      kind: "booking" | "membership" | "balance" | "skipped";
      /** False only when money is in but a Cal.com hold could not be confirmed. */
      calConfirmed: boolean;
      alreadyDone: boolean;
    };

type DoneRecord = { kind: "booking" | "membership" | "balance" | "skipped"; calConfirmed: boolean };

const KEEP_SECONDS = 60 * 60 * 24 * 30;
const LOCK_SECONDS = 120;
const doneKey = (id: string) => `stripe:done:${id}`;
const lockKey = (id: string) => `stripe:lock:${id}`;
const stepKey = (id: string, step: string) => `stripe:step:${id}:${step}`;

const log = (msg: string, ...rest: unknown[]) => console.log(`[BOOKING] ${msg}`, ...rest);
const logError = (msg: string, ...rest: unknown[]) => console.error(`[BOOKING] ${msg}`, ...rest);

export function stripeDashboardUrl(session: Stripe.Checkout.Session): string | undefined {
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (pi) return `https://dashboard.stripe.com/payments/${pi}`;
  const sub = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  if (sub) return `https://dashboard.stripe.com/subscriptions/${sub}`;
  return undefined;
}

export async function finalizePaidSession(session: Stripe.Checkout.Session): Promise<FinalizeResult> {
  if (session.payment_status !== "paid") {
    // Delayed methods complete first and pay later; async_payment_succeeded
    // brings the session back here once the money has actually landed.
    log("session not paid yet, nothing confirmed:", session.id, session.payment_status);
    return { status: "not_paid" };
  }

  const redis = getRedis();
  const prior = await redis.get<DoneRecord>(doneKey(session.id));
  if (prior) return { status: "done", ...prior, alreadyDone: true };

  const locked = await redis.set(lockKey(session.id), "1", { nx: true, ex: LOCK_SECONDS });
  if (locked === null) return { status: "busy" };

  try {
    const record: DoneRecord =
      session.mode === "subscription"
        ? await finalizeMembership(session)
        : session.metadata?.kind === "balance"
          ? await finalizeBalance(session)
          : session.mode === "payment"
          ? await finalizeBooking(session)
          : { kind: "skipped", calConfirmed: true };
    await redis.set(doneKey(session.id), record, { ex: KEEP_SECONDS });
    log("finalised", session.id, record);
    return { status: "done", ...record, alreadyDone: false };
  } finally {
    await redis.del(lockKey(session.id)).catch(() => {});
  }
}

/** Run a side effect at most once per session (marker written after it succeeds). */
async function once(sessionId: string, step: string, fn: () => Promise<unknown>) {
  const redis = getRedis();
  if (await redis.get(stepKey(sessionId, step))) return;
  await fn();
  await redis.set(stepKey(sessionId, step), "1", { ex: KEEP_SECONDS });
}

/** Confirm a hold; a hold that is already confirmed (a retry) counts as success. */
async function confirmHold(uid: string): Promise<boolean> {
  if (await confirmCalBooking(uid)) return true;
  const booking = await getCalBooking(uid);
  return booking?.status === "accepted" || booking?.status === "upcoming" || booking?.status === "past";
}

function customerOf(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  return {
    name: meta.customerName || session.customer_details?.name || session.customer_email || "Unknown",
    email: meta.customerEmail || session.customer_details?.email || session.customer_email || "",
  };
}

async function finalizeBooking(session: Stripe.Checkout.Session): Promise<DoneRecord> {
  const meta = session.metadata ?? {};

  const pendingBookingId = meta.pendingBookingId;
  let pending = pendingBookingId ? await getPendingBooking(pendingBookingId) : null;
  if (!pending) pending = await getPendingBookingByStripeSession(session.id);

  // The slot is held in Cal.com as an unconfirmed booking. A block booking
  // holds one Cal.com booking per day; confirm them all.
  const uids = pending
    ? allCalUids(pending)
    : (meta.calBookingUids || meta.calBookingUid || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

  let calConfirmed = uids.length > 0;
  for (const uid of uids) {
    if (!(await confirmHold(uid))) {
      calConfirmed = false;
      // Money has been taken but the slot is not secured. The studio email
      // says so loudly; this log line is for the record.
      logError("PAID BUT UNCONFIRMED - needs manual confirmation in Cal.com.", {
        session: session.id,
        uid,
      });
    }
  }
  if (!uids.length) logError("paid session has no Cal.com booking linked:", session.id);

  if (pending) await confirmPendingBooking(pending.id, session.id);

  const { name, email } = customerOf(session);

  await once(session.id, "saved", () =>
    saveBooking({
      name,
      email,
      date: meta.bookingDate || undefined,
      hours: meta.bookingHours || undefined,
      notes: meta.bookingNotes || undefined,
    })
  );

  if (meta.discountCode) {
    const code = meta.discountCode;
    await once(session.id, "discount", async () => {
      const { incrementDiscountUsage } = await import("./admin/kv");
      await incrementDiscountUsage(code);
    }).catch((err) => logError("failed to count discount use:", code, err));
  }

  // Awaited: an un-awaited send can be cut off when the function returns.
  // A failed email is logged but never undoes the booking.
  await once(session.id, "emailed", () =>
    sendBookingNotification({
      name,
      email,
      date: meta.bookingDate || undefined,
      hours: meta.bookingHours || undefined,
      notes: meta.bookingNotes || undefined,
      paid: true,
      calConfirmed,
      calBookingUids: uids,
      packageTitle: meta.packageTitle || undefined,
      stripeUrl: stripeDashboardUrl(session),
      totalPrice: meta.totalPrice,
      depositAmount: meta.depositAmount,
      balanceDue: meta.balanceDue,
      addonsSummary: meta.addonsSummary || undefined,
      addonsTotal: meta.addonsTotal || undefined,
    })
  ).catch((err) => logError("booking saved, but email failed:", session.id, err));

  // Booked close to the session: the daily job might not run in time, so send
  // the balance link now. A no-op for sessions further out.
  await sendBalanceLinkIfDue(session).catch((err) =>
    logError("could not send balance link:", session.id, err)
  );

  return { kind: "booking", calConfirmed };
}

async function finalizeBalance(session: Stripe.Checkout.Session): Promise<DoneRecord> {
  const { notify } = await recordBalancePaid(session, stripeDashboardUrl(session));
  await once(session.id, "emailed", notify).catch((err) =>
    logError("balance recorded, but email failed:", session.id, err)
  );
  return { kind: "balance", calConfirmed: true };
}

async function finalizeMembership(session: Stripe.Checkout.Session): Promise<DoneRecord> {
  const tierId = session.metadata?.tierId ?? "";
  const tier = MEMBERSHIP_TIERS[tierId];
  const { name, email } = customerOf(session);
  const monthly =
    session.amount_total != null ? (session.amount_total / 100).toFixed(2) : tier ? tier.amount.toFixed(2) : undefined;

  await once(session.id, "saved", () =>
    getRedis().rpush(
      "members",
      JSON.stringify({
        name,
        email,
        tierId,
        sessionId: session.id,
        subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
        createdAt: new Date().toISOString(),
      })
    )
  );

  await once(session.id, "emailed", () =>
    sendMembershipNotification({
      name,
      email,
      tierName: tier?.name ?? (tierId || "Membership"),
      monthlyAmount: monthly,
      stripeUrl: stripeDashboardUrl(session),
    })
  ).catch((err) => logError("membership saved, but email failed:", session.id, err));

  return { kind: "membership", calConfirmed: true };
}
