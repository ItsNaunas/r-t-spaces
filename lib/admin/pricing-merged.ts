import { BOOKING_PACKAGES, type BookingPackage } from "@/lib/pricing";
import {
  isPromotionLive,
  PROMO_FULL_DAY_ID,
  PROMO_HALF_DAY_ID,
  type Promotion,
} from "@/lib/promotion";
import { getPromotion } from "@/lib/promotionStore";
import { getPackageOverrides } from "./kv";

export type MergedPackage = BookingPackage & {
  enabled: boolean;
  priceOverrideActive: boolean;
};

/**
 * The packages as they are sold right now: admin overrides applied, and the
 * special offer swapped in for the normal half/full day while it is live.
 * Offer prices come only from the promotion, never from package overrides.
 */
export async function getMergedPackages(now: Date = new Date()): Promise<MergedPackage[]> {
  const [overrides, promotion] = await Promise.all([getPackageOverrides(), getPromotion()]);
  const promoLive = isPromotionLive(promotion, now);

  return BOOKING_PACKAGES.map((pkg) => {
    if (pkg.promoOnly) {
      return { ...pkg, ...promoPrices(pkg.id, promotion), enabled: promoLive, priceOverrideActive: false };
    }
    const override = overrides[pkg.id];
    const enabled = override?.enabled ?? true;
    return {
      ...pkg,
      price: override?.priceOverride ?? pkg.price,
      enabled: enabled && !(promoLive && pkg.hiddenDuringPromo),
      priceOverrideActive: override?.priceOverride != null,
    };
  });
}

function promoPrices(id: string, p: Promotion): Partial<Pick<BookingPackage, "price" | "weekendPrice">> {
  const prices = id === PROMO_HALF_DAY_ID ? p.halfDay : id === PROMO_FULL_DAY_ID ? p.fullDay : null;
  return prices ? { price: prices.weekday, weekendPrice: prices.weekend } : {};
}
