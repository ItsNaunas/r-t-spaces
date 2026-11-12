import { getRedis } from "./redis";

/**
 * A record of what was done in the admin portal: refunds, cancellations,
 * payments marked, bookings added, prices changed. Everyone shares one login,
 * so it says what and when, not who. Newest first; the last 2,000 are kept.
 */
export type ActivityEntry = {
  at: string;
  /** Short machine-readable kind, e.g. "refund", "cancel", "voucher.issue". */
  action: string;
  /** One plain sentence for the log page. */
  summary: string;
  /** Booking, voucher, member or code it concerns, when there is one. */
  ref?: string;
  /** Pounds, when money moved. */
  amount?: number;
};

const KEY = "activity:log";
const KEEP = 2000;

export async function logActivity(entry: Omit<ActivityEntry, "at">, now: Date = new Date()): Promise<void> {
  try {
    const redis = getRedis();
    await redis.lpush(KEY, JSON.stringify({ ...entry, at: now.toISOString() }));
    await redis.ltrim(KEY, 0, KEEP - 1);
  } catch (error) {
    // The action itself already happened; never fail it over the log.
    console.error("[ACTIVITY] could not record:", entry.action, error);
  }
}

export async function listActivity(limit = 300): Promise<ActivityEntry[]> {
  const items = await getRedis().lrange<ActivityEntry>(KEY, 0, limit - 1);
  return (items ?? []).slice(0, limit);
}
