import { Redis } from "@upstash/redis";

/** Shared Upstash Redis client. Used for bookings, pending bookings, discounts and packages. */
export function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN must be set");
  }
  return new Redis({ url, token });
}
