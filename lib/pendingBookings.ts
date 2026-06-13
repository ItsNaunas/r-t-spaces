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

async function put(booking: PendingBooking): Promise<void> {
  const redis = getRedis();
  await redis.set(key(booking.id), JSON.stringify(booking));
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
  pipeline.set(key(newBooking.id), JSON.stringify(newBooking));
  pipeline.sadd(IDS_KEY, newBooking.id);
  if (newBooking.calendlyEventUri) {
    pipeline.set(calendlyIdx(newBooking.calendlyEventUri), newBooking.id);
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
  pipeline.set(key(id), JSON.stringify(booking));
  pipeline.set(stripeIdx(stripeSessionId), id);
  await pipeline.exec();
  return true;
}

export async function confirmPendingBooking(id: string, stripeSessionId?: string): Promise<boolean> {
  const booking = await getPendingBooking(id);
  if (!booking) return false;
  booking.status = "confirmed";
  if (stripeSessionId) {
    booking.stripeSessionId = stripeSessionId;
    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.set(key(id), JSON.stringify(booking));
    pipeline.set(stripeIdx(stripeSessionId), id);
    await pipeline.exec();
    return true;
  }
  await put(booking);
  return true;
}

export async function cancelPendingBooking(id: string, reason?: string): Promise<boolean> {
  const booking = await getPendingBooking(id);
  if (!booking) return false;

  if (booking.status === "pending" && booking.calendlyEventUri) {
    await cancelCalendlyEvent(booking.calendlyEventUri, reason || "Payment not completed within 15 minutes");
  }

  booking.status = "cancelled";
  await put(booking);
  return true;
}

export async function cancelExpiredPendingBookings(): Promise<number> {
  const all = await loadAll();
  const now = new Date();
  let cancelledCount = 0;

  for (const booking of all) {
    if (booking.status === "pending" && new Date(booking.expiresAt) < now) {
      if (booking.calendlyEventUri) {
        await cancelCalendlyEvent(
          booking.calendlyEventUri,
          "Payment not completed within 15 minutes"
        );
      }
      booking.status = "cancelled";
      await put(booking);
      cancelledCount++;
    }
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
