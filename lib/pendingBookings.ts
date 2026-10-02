import { getRedis } from "./redis";
import { cancelCalBooking } from "./calcom";

export type PendingBooking = {
  id: string;
  /** Cal.com booking uid. The booking exists but is unconfirmed until paid. */
  calBookingUid: string;
  customerName: string;
  customerEmail: string;
  startTime: string;
  endTime: string;
  stripeSessionId?: string;
  createdAt: string;
  expiresAt: string; // HOLD_MINUTES from creation
  status: "pending" | "confirmed" | "cancelled";
  bookingData?: {
    packageId?: string;
    packageTitle?: string;
    totalPrice?: number;
    depositAmount?: number;
    addonsTotal?: number;
    addonsSummary?: string;
  };
};

const key = (id: string) => `pending:${id}`;
const IDS_KEY = "pending:ids";
const stripeIdx = (sessionId: string) => `pending:stripe:${sessionId}`;
const calIdx = (uid: string) => `pending:cal:${uid}`;

// All pending:* records self-expire after 24h (covers the Stripe checkout
// session lifetime + webhook). Keeps Redis from accumulating dead records.
const TTL_SECONDS = 24 * 60 * 60;

/**
 * How long a customer has to pay. Stripe will not expire a Checkout Session
 * sooner than 30 minutes, so the session gets 31 (a minute of slack for the
 * request in flight) and closes itself; its checkout.session.expired webhook
 * releases the hold. The hold outlives the session by a few minutes so the
 * daily backstop sweep can never release a slot that is still payable.
 */
export const CHECKOUT_WINDOW_MINUTES = 31;
const HOLD_MINUTES = CHECKOUT_WINDOW_MINUTES + 5;
const UNPAID_REASON = "Payment not completed in time";

export async function savePendingBooking(
  booking: Omit<PendingBooking, "createdAt" | "expiresAt" | "status">
): Promise<PendingBooking> {
  const redis = getRedis();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

  const newBooking: PendingBooking = {
    ...booking,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "pending",
  };

  const pipeline = redis.pipeline();
  pipeline.set(key(newBooking.id), JSON.stringify(newBooking), { ex: TTL_SECONDS });
  pipeline.sadd(IDS_KEY, newBooking.id);
  if (newBooking.calBookingUid) {
    pipeline.set(calIdx(newBooking.calBookingUid), newBooking.id, { ex: TTL_SECONDS });
  }
  await pipeline.exec();
  return newBooking;
}

export async function getPendingBooking(id: string): Promise<PendingBooking | null> {
  const redis = getRedis();
  return redis.get<PendingBooking>(key(id));
}

export async function getPendingBookingByCalUid(
  calBookingUid: string
): Promise<PendingBooking | null> {
  const redis = getRedis();
  const id = await redis.get<string>(calIdx(calBookingUid));
  if (!id) return null;
  const booking = await getPendingBooking(id);
  return booking && booking.status === "pending" ? booking : null;
}

export async function getPendingBookingByStripeSession(
  stripeSessionId: string
): Promise<PendingBooking | null> {
  const redis = getRedis();
  const id = await redis.get<string>(stripeIdx(stripeSessionId));
  if (!id) return null;
  return getPendingBooking(id);
}

export async function updatePendingBookingStripeSession(
  id: string,
  stripeSessionId: string
): Promise<boolean> {
  const booking = await getPendingBooking(id);
  if (!booking) return false;
  booking.stripeSessionId = stripeSessionId;
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(key(id), JSON.stringify(booking), { ex: TTL_SECONDS });
  pipeline.set(stripeIdx(stripeSessionId), id, { ex: TTL_SECONDS });
  await pipeline.exec();
  return true;
}

export async function confirmPendingBooking(id: string, stripeSessionId?: string): Promise<boolean> {
  const booking = await getPendingBooking(id);
  if (!booking) return false;
  booking.status = "confirmed";
  if (stripeSessionId) booking.stripeSessionId = stripeSessionId;

  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(key(id), JSON.stringify(booking), { ex: TTL_SECONDS });
  if (stripeSessionId) {
    pipeline.set(stripeIdx(stripeSessionId), id, { ex: TTL_SECONDS });
  }
  // No longer an active pending hold — drop it from the scan set.
  pipeline.srem(IDS_KEY, id);
  await pipeline.exec();
  return true;
}

export async function cancelPendingBooking(id: string, reason?: string): Promise<boolean> {
  const booking = await getPendingBooking(id);
  if (!booking) return false;

  if (booking.status === "pending" && booking.calBookingUid) {
    await cancelCalBooking(booking.calBookingUid, reason || UNPAID_REASON);
  }

  booking.status = "cancelled";
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(key(id), JSON.stringify(booking), { ex: TTL_SECONDS });
  pipeline.srem(IDS_KEY, id);
  await pipeline.exec();
  return true;
}

export async function cancelExpiredPendingBookings(): Promise<number> {
  const all = await loadAll();
  const now = new Date();
  let cancelledCount = 0;

  for (const snapshot of all) {
    if (snapshot.status !== "pending" || new Date(snapshot.expiresAt) >= now) continue;

    // Re-read immediately before cancelling: the booking may have been
    // confirmed/paid between the snapshot load and now. Don't cancel a paid one.
    const current = await getPendingBooking(snapshot.id);
    if (!current || current.status !== "pending") continue;

    if (current.calBookingUid) {
      await cancelCalBooking(current.calBookingUid, UNPAID_REASON);
    }
    current.status = "cancelled";
    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.set(key(current.id), JSON.stringify(current), { ex: TTL_SECONDS });
    pipeline.srem(IDS_KEY, current.id);
    await pipeline.exec();
    cancelledCount++;
  }

  return cancelledCount;
}

export async function getAllPendingBookings(): Promise<PendingBooking[]> {
  const all = await loadAll();
  return all.filter((b) => b.status === "pending");
}

async function loadAll(): Promise<PendingBooking[]> {
  const redis = getRedis();
  const ids = await redis.smembers(IDS_KEY);
  if (!ids.length) return [];
  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get<PendingBooking>(key(id));
  const results = await pipeline.exec<(PendingBooking | null)[]>();
  return results.filter(Boolean) as PendingBooking[];
}
