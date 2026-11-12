import { getRedis } from "./redis";
import { sendAlertEmail } from "./email";

/**
 * Tell the developer when something breaks, because Vercel Hobby keeps logs
 * for an hour and problems (like the missing MX record in Nov 2026) can
 * otherwise go unnoticed for days.
 *
 * Every alert is kept for 14 days for /admin/activity. An email goes to
 * ALERT_EMAIL at most once an hour per kind of problem; later ones in that
 * hour are counted and mentioned in the next email.
 */
export type AlertEntry = { at: string; kind: string; message: string; detail?: string };

const LOG = "alerts:log";
const KEEP = 500;
const LOG_DAYS = 14;
const THROTTLE_SECONDS = 60 * 60;
const CRON_OK = "cron:last-success";

const throttleKey = (kind: string) => `alerts:throttle:${kind}`;
const suppressedKey = (kind: string) => `alerts:suppressed:${kind}`;

function describe(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 1500);
  try {
    return JSON.stringify(error).slice(0, 1500);
  } catch {
    return String(error).slice(0, 1500);
  }
}

/** Record a problem and, unless one of this kind was emailed in the last hour, email it. */
export async function alert(kind: string, message: string, error?: unknown, now: Date = new Date()): Promise<void> {
  const entry: AlertEntry = { at: now.toISOString(), kind, message, ...(error !== undefined ? { detail: describe(error) } : {}) };
  console.error(`[ALERT] ${kind}: ${message}`, error ?? "");
  try {
    const redis = getRedis();
    await redis.lpush(LOG, JSON.stringify(entry));
    await redis.ltrim(LOG, 0, KEEP - 1);

    const to = process.env.ALERT_EMAIL;
    if (!to) return;
    const first = await redis.set(throttleKey(kind), now.toISOString(), { nx: true, ex: THROTTLE_SECONDS });
    if (!first) {
      await redis.incr(suppressedKey(kind));
      return;
    }
    const suppressed = Number((await redis.get(suppressedKey(kind))) ?? 0);
    await redis.del(suppressedKey(kind));
    await sendAlertEmail(to, entry, suppressed);
  } catch (sendError) {
    // An alert must never break the thing that raised it.
    console.error("[ALERT] could not record or send:", sendError);
  }
}

export async function listAlerts(now: Date = new Date()): Promise<AlertEntry[]> {
  const items = (await getRedis().lrange<AlertEntry>(LOG, 0, KEEP - 1)) ?? [];
  const cutoff = now.getTime() - LOG_DAYS * 24 * 60 * 60 * 1000;
  return items.filter((a) => Date.parse(a.at) >= cutoff);
}

/** The daily job finished with everything working. */
export async function markCronSuccess(now: Date = new Date()): Promise<void> {
  await getRedis().set(CRON_OK, now.toISOString());
}

export async function lastCronSuccess(): Promise<string | null> {
  return getRedis().get<string>(CRON_OK);
}
