import { getRedis } from "./redis";

/**
 * Fixed-window rate limiter backed by Redis.
 *
 * Deliberately simple: INCR a per-window key and set a TTL on first use. A
 * burst can straddle a window boundary, which is fine for what this guards
 * (password guessing, discount-code enumeration) — the goal is to make
 * automated attempts impractical, not to be exact.
 *
 * Fails OPEN: if Redis is unavailable, the limiter allows the request rather
 * than locking the studio out of their own admin.
 */
export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const key = `ratelimit:${bucket}:${identifier}:${window}`;

    const redis = getRedis();
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);

    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch (error) {
    console.error("Rate limiter unavailable, allowing request:", error);
    return { allowed: true, remaining: limit };
  }
}

/**
 * Best-effort client IP. Vercel sets x-forwarded-for; the left-most entry is
 * the client. Falls back to a constant so a missing header degrades to a
 * shared bucket rather than no limit at all.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
