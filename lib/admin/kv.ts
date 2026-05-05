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
const CODES_INDEX_KEY = "discount:codes";

export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  const redis = getRedis();
  const codes = await redis.smembers(CODES_INDEX_KEY);
  if (!codes.length) return [];
  const pipeline = redis.pipeline();
  for (const code of codes) pipeline.get(codeKey(code));
  const results = await pipeline.exec();
  return (results as (DiscountCode | null)[]).filter(Boolean) as DiscountCode[];
}

export async function getDiscountCode(code: string): Promise<DiscountCode | null> {
  const redis = getRedis();
  return redis.get<DiscountCode>(codeKey(code));
}

export async function saveDiscountCode(code: DiscountCode): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.set(codeKey(code.code), JSON.stringify(code));
  pipeline.sadd(CODES_INDEX_KEY, code.code.toUpperCase());
  await pipeline.exec();
}

export async function deleteDiscountCode(code: string): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.del(codeKey(code));
  pipeline.srem(CODES_INDEX_KEY, code.toUpperCase());
  await pipeline.exec();
}

export async function incrementDiscountUsage(code: string): Promise<void> {
  const redis = getRedis();
  const existing = await getDiscountCode(code);
  if (!existing) return;
  await redis.set(codeKey(code), JSON.stringify({ ...existing, usedCount: existing.usedCount + 1 }));
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
