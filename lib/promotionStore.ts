import { getRedis } from "./redis";
import { DEFAULT_PROMOTION, type Promotion } from "./promotion";

const PROMO_KEY = "promo:config";

/** The saved promotion, or the (switched-off) defaults if none has been saved. */
export async function getPromotion(): Promise<Promotion> {
  const saved = await getRedis().get<Promotion>(PROMO_KEY);
  return saved ? { ...DEFAULT_PROMOTION, ...saved } : DEFAULT_PROMOTION;
}

export async function savePromotion(p: Promotion): Promise<Promotion> {
  const record = { ...p, updatedAt: new Date().toISOString() };
  await getRedis().set(PROMO_KEY, JSON.stringify(record));
  return record;
}
