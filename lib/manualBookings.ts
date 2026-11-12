import { randomBytes } from "node:crypto";
import { getRedis } from "./redis";

/**
 * Bookings the studio adds by hand (phone, WhatsApp, walk-ins) from
 * /admin/bookings. Each one is a confirmed Cal.com booking, so the slot is
 * gone from the website, plus this record of what was agreed and paid.
 * Money taken in person never touches Stripe; a balance still owed can be
 * paid through the same emailed link as an online booking (lib/balance.ts).
 */
export type ManualBooking = {
  /** Always starts with "manual_", which is how lib/balance.ts tells them apart. */
  id: string;
  calBookingUid: string;
  name: string;
  /** Empty when the customer gave none. */
  email: string;
  phone: string;
  notes: string;
  packageId: string;
  packageTitle: string;
  start: string;
  end: string;
  /** Display strings, same format as online bookings. */
  bookingDate: string;
  bookingHours: string;
  /** Pounds. */
  totalPrice: number;
  /** Pounds taken in person when it was booked. */
  paidUpfront: number;
  /** Whether the customer gets our emails (confirmation, balance link, review). */
  emailCustomer: boolean;
  createdAt: string;
  /** Set when the rest was paid, in person or through the balance link. */
  paidInFullAt?: string;
  cancelledAt?: string;
  /** "voucher": booked online with a gift voucher covering the deposit. Absent: added by the studio. */
  via?: "voucher";
  voucherCode?: string;
  /** Attribution, for bookings made online. */
  source?: string;
};

export const isManualId = (id: string) => id.startsWith("manual_");

const key = (id: string) => `manual:${id}`;
/** Sorted by session start (ms), for upcoming lists and the daily jobs. */
const BY_START = "manual:by-start";
const KEEP_SECONDS = 60 * 60 * 24 * 400;

export function newManualId(): string {
  return `manual_${randomBytes(9).toString("base64url")}`;
}

/** Pounds still owed: nothing once paid in full or cancelled. */
export function manualOwed(b: ManualBooking): number {
  if (b.paidInFullAt || b.cancelledAt) return 0;
  return Math.max(0, Math.round((b.totalPrice - b.paidUpfront) * 100) / 100);
}

export async function saveManualBooking(b: ManualBooking): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(key(b.id), b, { ex: KEEP_SECONDS });
  pipeline.zadd(BY_START, { score: Date.parse(b.start), member: b.id });
  await pipeline.exec();
}

export async function getManualBooking(id: string): Promise<ManualBooking | null> {
  if (!isManualId(id)) return null;
  return getRedis().get<ManualBooking>(key(id));
}

/** Manual bookings starting in [from, to), soonest first. */
export async function listManualBookings(from: Date, to: Date): Promise<ManualBooking[]> {
  const redis = getRedis();
  const ids = await redis.zrange<string[]>(BY_START, from.getTime(), to.getTime() - 1, { byScore: true });
  if (!ids.length) return [];
  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get<ManualBooking>(key(id));
  const results = await pipeline.exec<(ManualBooking | null)[]>();
  return results.filter((b): b is ManualBooking => Boolean(b));
}

export async function updateManualBooking(
  id: string,
  patch: Partial<Pick<ManualBooking, "paidInFullAt" | "cancelledAt">>
): Promise<ManualBooking | null> {
  const current = await getManualBooking(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  await getRedis().set(key(id), next, { ex: KEEP_SECONDS });
  return next;
}
