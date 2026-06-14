import { getRedis } from "./redis";
import { cancelCalendlyEvent } from "./calendlyApi";

export type PendingBooking = {
  id: string;
  calendlyEventUri: string;
  calendlyInviteeUri?: string;
  customerName: string;
  customerEmail: string;
  startTime: string;
  endTime: string;
  stripeSessionId?: string;
  createdAt: string;
  expiresAt: string; // 15 minutes from creation
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
const calendlyIdx = (eventUri: string) => `pending:calendly:${eventUri}`;

// All pending:* records self-expire after 24h (covers the Stripe checkout
// session lifetime + webhook). Keeps Redis from accumulating dead records.
const TTL_SECONDS = 24 * 60 * 60;

async function put(booking: PendingBooking): Promise<void> {
  const redis = getRedis();
  await redis.set(key(booking.id), JSON.stringify(booking), { ex: TTL_SECONDS });
}

export async function savePendingBooking(
  booking: Omit<PendingBooking, "createdAt" | "expiresAt" | "status">
): Promise<PendingBooking> {
  const redis = getRedis();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

  const newBooking: PendingBooking = {
    ...booking,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "pending",
  };

  const pipeline = redis.pipeline();
  pipeline.set(key(newBooking.id), JSON.stringify(newBooking), { ex: TTL_SECONDS });
  pipeline.sadd(IDS_KEY, newBooking.id);
  if (newBooking.calendlyEventUri) {
    pipeline.set(calendlyIdx(newBooking.calendlyEventUri), newBooking.id, { ex: TTL_SECONDS });
  }
  await pipeline.exec();
  return newBooking;
}

export async function getPendingBooking(id: string): Promise<PendingBooking | null> {
  const redis = getRedis();
  return redis.get<PendingBooking>(key(id));
}

export async function getPendingBookingByCalendlyEvent(
  calendlyEventUri: string
): Promise<PendingBooking | null> {
  const redis = getRedis();
  const id = await redis.get<string>(calendlyIdx(calendlyEventUri));
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

  if (booking.status === "pending" && booking.calendlyEventUri) {
    await cancelCalendlyEvent(booking.calendlyEventUri, reason || "Payment not completed within 15 minutes");
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

    if (current.calendlyEventUri) {
      await cancelCalendlyEvent(
        current.calendlyEventUri,
        "Payment not completed within 15 minutes"
      );
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
