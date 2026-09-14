import { Redis } from "@upstash/redis";
import type { DiscountCode, PackageOverride } from "./types";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN must be set");
  }
  return new Redis({ url, token });
}

// ─── Discount Codes ──────────────────────────────────────────────────────────

const codeKey = (code: string) => `discount:code:${code.toUpperCase()}`;
/**
 * Usage lives in its own counter key rather than inside the record.
 *
 * It used to be a field updated with read-modify-write, so two checkouts
 * redeeming the same code within a few milliseconds of each other would both
 * read the same count and write the same number back — a code capped at 10
 * uses could be redeemed many more times. INCR is atomic, so it cannot.
 */
const usageKey = (code: string) => `discount:used:${code.toUpperCase()}`;
const CODES_INDEX_KEY = "discount:codes";

export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  const redis = getRedis();
  const codes = await redis.smembers(CODES_INDEX_KEY);
  if (!codes.length) return [];

  const pipeline = redis.pipeline();
  for (const code of codes) pipeline.get(codeKey(code));
  for (const code of codes) pipeline.get(usageKey(code));
  const results = await pipeline.exec();

  const records = results.slice(0, codes.length) as (DiscountCode | null)[];
  const counts = results.slice(codes.length) as (number | null)[];

  return records
    .map((record, i) => (record ? { ...record, usedCount: counts[i] ?? record.usedCount ?? 0 } : null))
    .filter(Boolean) as DiscountCode[];
}

export async function getDiscountCode(code: string): Promise<DiscountCode | null> {
  const redis = getRedis();
  const [record, used] = await Promise.all([
    redis.get<DiscountCode>(codeKey(code)),
    redis.get<number>(usageKey(code)),
  ]);
  if (!record) return null;
  return { ...record, usedCount: used ?? record.usedCount ?? 0 };
}

export async function saveDiscountCode(code: DiscountCode): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(codeKey(code.code), JSON.stringify(code));
  pipeline.sadd(CODES_INDEX_KEY, code.code.toUpperCase());
  // Seed the counter only if absent, so editing a code does not reset how many
  // times it has already been redeemed.
  pipeline.setnx(usageKey(code.code), code.usedCount ?? 0);
  await pipeline.exec();
}

export async function deleteDiscountCode(code: string): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.del(codeKey(code));
  pipeline.del(usageKey(code));
  pipeline.srem(CODES_INDEX_KEY, code.toUpperCase());
  await pipeline.exec();
}

export async function incrementDiscountUsage(code: string): Promise<void> {
  const redis = getRedis();
  await redis.incr(usageKey(code));
}

// ─── Package Overrides ───────────────────────────────────────────────────────

const OVERRIDES_KEY = "package:overrides";

export async function getPackageOverrides(): Promise<Record<string, PackageOverride>> {
  const redis = getRedis();
  const data = await redis.get<Record<string, PackageOverride>>(OVERRIDES_KEY);
  return data ?? {};
}

export async function upsertPackageOverride(override: PackageOverride): Promise<void> {
  const redis = getRedis();
  const current = await getPackageOverrides();
  current[override.packageId] = override;
  await redis.set(OVERRIDES_KEY, JSON.stringify(current));
}

export async function deletePackageOverride(packageId: string): Promise<void> {
  const redis = getRedis();
  const current = await getPackageOverrides();
  delete current[packageId];
  await redis.set(OVERRIDES_KEY, JSON.stringify(current));
}
