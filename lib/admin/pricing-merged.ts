import { BOOKING_PACKAGES, type BookingPackage } from "@/lib/pricing";
import { getPackageOverrides } from "./kv";

export type MergedPackage = BookingPackage & {
  enabled: boolean;
  priceOverrideActive: boolean;
};

export async function getMergedPackages(): Promise<MergedPackage[]> {
  const overrides = await getPackageOverrides();
  return BOOKING_PACKAGES.map((pkg) => {
    const override = overrides[pkg.id];
    return {
      ...pkg,
      price: override?.priceOverride ?? pkg.price,
      enabled: override?.enabled ?? true,
      priceOverrideActive: override?.priceOverride != null,
    };
  });
}
