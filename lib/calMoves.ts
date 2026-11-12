import { getRedis } from "./redis";

/**
 * Cal.com gives a rescheduled booking a new uid. Online bookings keep the old
 * uid in their Stripe metadata, which can't be edited, so every move is
 * recorded here (old uid -> new uid and new time). Anything that looks a
 * booking up by uid resolves it through here first: balance timing, the
 * Upcoming page, refunds and cancellations, review requests.
 */
export type CalMove = {
  newUid: string;
  start: string;
  end: string;
  /** Display strings, same format as booking metadata. */
  bookingDate: string;
  bookingHours: string;
  movedAt: string;
  by: "studio" | "customer";
};

const key = (uid: string) => `cal:moved:${uid}`;
const KEEP_SECONDS = 60 * 60 * 24 * 400;
const MAX_HOPS = 10;

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "full" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit" });

export function displayTimes(start: string, end: string) {
  return {
    bookingDate: dateFmt.format(new Date(start)),
    bookingHours: `${timeFmt.format(new Date(start))} – ${timeFmt.format(new Date(end))}`,
  };
}

export async function recordMove(
  oldUid: string,
  move: { newUid: string; start: string; end: string; by: CalMove["by"] },
  now: Date = new Date()
): Promise<CalMove> {
  const record: CalMove = { ...move, ...displayTimes(move.start, move.end), movedAt: now.toISOString() };
  await getRedis().set(key(oldUid), record, { ex: KEEP_SECONDS });
  return record;
}

export async function getMove(uid: string): Promise<CalMove | null> {
  return getRedis().get<CalMove>(key(uid));
}

/** Follow moves to the booking's current uid (and its latest move, if any). */
export async function resolveCalUid(uid: string): Promise<{ uid: string; move: CalMove | null }> {
  let current = uid;
  let latest: CalMove | null = null;
  for (let i = 0; i < MAX_HOPS; i++) {
    const move = await getMove(current);
    if (!move || move.newUid === current) break;
    latest = move;
    current = move.newUid;
  }
  return { uid: current, move: latest };
}

/** The latest move for each uid (one hop is enough for display), batched. */
export async function getMoves(uids: string[]): Promise<Record<string, CalMove>> {
  if (!uids.length) return {};
  const pipeline = getRedis().pipeline();
  for (const u of uids) pipeline.get<CalMove>(key(u));
  const results = await pipeline.exec<(CalMove | null)[]>();
  const out: Record<string, CalMove> = {};
  uids.forEach((u, i) => {
    if (results[i]) out[u] = results[i]!;
  });
  return out;
}

export async function resolveCalUids(uids: string[]): Promise<string[]> {
  return Promise.all(uids.map(async (u) => (await resolveCalUid(u)).uid));
}

const studioMoveKey = (uid: string) => `cal:studio-move:${uid}`;

/** Set just before the studio moves a booking from the portal, so Cal.com's webhook knows. */
export async function markStudioMove(uid: string): Promise<void> {
  await getRedis().set(studioMoveKey(uid), "1", { ex: 600 });
}

export async function isStudioMove(uid: string): Promise<boolean> {
  return Boolean(await getRedis().get(studioMoveKey(uid)));
}
