import { getDiscountCode } from "./kv";
import { getDepositForPackage } from "@/lib/pricing";
import type { BookingPackage } from "@/lib/pricing";
import type { ValidateDiscountResponse } from "./types";

export async function validateDiscountCode(
  code: string,
  packageId: string,
  basePrice: number,
  pkg?: BookingPackage
): Promise<ValidateDiscountResponse> {
  const record = await getDiscountCode(code.toUpperCase());

  if (!record || !record.active) {
    return { valid: false, error: "Code not found" };
  }
  if (record.expiresAt && new Date(record.expiresAt) <= new Date()) {
    return { valid: false, error: "Code expired" };
  }
  if (record.maxUses !== null && record.usedCount >= record.maxUses) {
    return { valid: false, error: "Usage limit reached" };
  }
  if (record.scope !== "global" && record.scope !== packageId) {
    return { valid: false, error: "Code not applicable to this package" };
  }

  const discountAmount =
    record.type === "percentage"
      ? Math.round((basePrice * record.value) / 100 * 100) / 100
      : Math.min(record.value, basePrice);

  const finalPrice = Math.max(0, basePrice - discountAmount);
  const finalDeposit = pkg
    ? getDepositForPackage(pkg, finalPrice)
    : Math.round(finalPrice * 50) / 100;

  return {
    valid: true,
    code: record.code,
    type: record.type,
    value: record.value,
    discountAmount,
    finalPrice,
    finalDeposit,
  };
}
