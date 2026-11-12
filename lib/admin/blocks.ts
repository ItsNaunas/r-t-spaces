import { randomBytes } from "node:crypto";
import { getRedis } from "@/lib/redis";
import { cancelCalBooking, confirmCalBooking, createCalBooking, getEventTypeId } from "@/lib/calcom";
import { displayTimes } from "@/lib/calMoves";
import { logActivity } from "@/lib/activity";

/**
 * Closing the studio for a while (private shoot, maintenance, holiday) with
 * no customer involved. Cal.com has no simple "busy" block in its API, so a
 * block is a confirmed booking on the hourly-hire event type in the studio's
 * own name: Cal.com treats it like any booking, so that time stops showing
 * on every package. Hourly hire allows 2 to 9 hours per block.
 */
export const BLOCK_EVENT_SLUG = "standard-rate";
export const BLOCK_MIN_HOURS = 2;
export const BLOCK_MAX_HOURS = 9;

export type Block = {
  id: string;
  calBookingUid: string;
  start: string;
  end: string;
  bookingDate: string;
  bookingHours: string;
  reason: string;
  createdAt: string;
};

const key = (id: string) => `block:${id}`;
const BY_START = "block:by-start";
const KEEP_SECONDS = 60 * 60 * 24 * 400;

export class BlockError extends Error {}

export async function createBlock(input: { start: string; hours: number; reason: string }): Promise<Block> {
  if (!Number.isInteger(input.hours) || input.hours < BLOCK_MIN_HOURS || input.hours > BLOCK_MAX_HOURS) {
    throw new BlockError(`Blocks are ${BLOCK_MIN_HOURS} to ${BLOCK_MAX_HOURS} hours. For a whole day, use ${BLOCK_MAX_HOURS}.`);
  }
  if (Number.isNaN(Date.parse(input.start)) || Date.parse(input.start) < Date.now()) {
    throw new BlockError("Choose a time in the future");
  }
  const reason = input.reason.trim().slice(0, 80) || "Studio closed";
  const eventTypeId = await getEventTypeId(BLOCK_EVENT_SLUG);
  if (!eventTypeId) throw new BlockError("The hourly hire event type is missing in Cal.com");

  let booking;
  try {
    booking = await createCalBooking({
      eventTypeId,
      start: input.start,
      name: `Studio closed: ${reason}`,
      email: process.env.STUDIO_EMAIL || "enquires@rtspaces.co.uk",
      notes: "Blocked out from the admin portal. Not a customer booking.",
      lengthInMinutes: input.hours * 60,
    });
  } catch (error) {
    console.error("[ADMIN] Cal.com refused the block:", error);
    throw new BlockError("Cal.com wouldn't block that time. Part of it may already be booked: pick another.");
  }
  if (booking.status !== "accepted" && !(await confirmCalBooking(booking.uid))) {
    await cancelCalBooking(booking.uid, "Could not confirm a studio block");
    throw new BlockError("Cal.com wouldn't confirm the block, so it was removed. Try again.");
  }

  const end = booking.end || new Date(Date.parse(booking.start) + input.hours * 3600_000).toISOString();
  const block: Block = {
    id: `block_${randomBytes(9).toString("base64url")}`,
    calBookingUid: booking.uid,
    start: booking.start,
    end,
    ...displayTimes(booking.start, end),
    reason,
    createdAt: new Date().toISOString(),
  };
  const redis = getRedis();
  await redis.set(key(block.id), block, { ex: KEEP_SECONDS });
  await redis.zadd(BY_START, { score: Date.parse(block.start), member: block.id });
  await logActivity({ action: "block.add", summary: `Blocked out ${block.bookingDate} ${block.bookingHours}: ${reason}`, ref: block.id });
  return block;
}

export async function listBlocks(from: Date, to: Date): Promise<Block[]> {
  const redis = getRedis();
  const ids = await redis.zrange<string[]>(BY_START, from.getTime(), to.getTime(), { byScore: true });
  if (!ids.length) return [];
  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get<Block>(key(id));
  return (await pipeline.exec<(Block | null)[]>()).filter((b): b is Block => Boolean(b));
}

export async function removeBlock(id: string): Promise<boolean> {
  const redis = getRedis();
  const block = await redis.get<Block>(key(id));
  if (!block) return false;
  if (!(await cancelCalBooking(block.calBookingUid, "Studio block removed"))) {
    throw new BlockError("Cal.com wouldn't remove the block. Cancel it in Cal.com.");
  }
  await redis.del(key(id));
  await redis.zrem(BY_START, id);
  await logActivity({ action: "block.remove", summary: `Reopened ${block.bookingDate} ${block.bookingHours} (was: ${block.reason})`, ref: id });
  return true;
}
