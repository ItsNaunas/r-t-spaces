import { getRedis } from "./redis";
import type { PendingBooking } from "./pendingBookings";

/**
 * Holds released because the customer never paid. They are queued here when
 * the hold is released (Checkout expired, payment failed, or the daily sweep)
 * and emailed "Still want to book?" by the daily job in lib/followUps.ts.
 * Holds released for other reasons (the customer changed package, the studio
 * cancelled in Cal.com) are never queued.
 */
export type AbandonedHold = {
  id: string;
  name: string;
  email: string;
  packageTitle?: string;
  start: string;
  heldAt: string;
  releasedAt: string;
};

const QUEUE = "followup:abandoned";
const recordKey = (id: string) => `followup:abandoned:${id}`;
const KEEP_SECONDS = 60 * 60 * 24 * 7;

export async function queueAbandonedHold(hold: PendingBooking, now: Date = new Date()): Promise<void> {
  if (!hold.customerEmail) return;
  const record: AbandonedHold = {
    id: hold.id,
    name: hold.customerName,
    email: hold.customerEmail.toLowerCase(),
    packageTitle: hold.bookingData?.packageTitle,
    start: hold.startTime,
    heldAt: hold.createdAt,
    releasedAt: now.toISOString(),
  };
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(recordKey(hold.id), record, { ex: KEEP_SECONDS });
  pipeline.zadd(QUEUE, { score: now.getTime(), member: hold.id });
  await pipeline.exec();
}

/** Holds released between from and to (inclusive). */
export async function listAbandonedHolds(from: Date, to: Date): Promise<AbandonedHold[]> {
  const redis = getRedis();
  const ids = await redis.zrange<string[]>(QUEUE, from.getTime(), to.getTime(), { byScore: true });
  if (!ids.length) return [];
  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get<AbandonedHold>(recordKey(id));
  const results = await pipeline.exec<(AbandonedHold | null)[]>();
  return results.filter((h): h is AbandonedHold => Boolean(h));
}
