export type DiscountType = "percentage" | "fixed";

export type DiscountCode = {
  code: string;
  type: DiscountType;
  value: number;
  scope: "global" | string[]; // array of package IDs, or "global" for all
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
};

export type PackageOverride = {
  packageId: string;
  enabled: boolean;
  priceOverride: number | null;
  updatedAt: string;
};

export type ValidateDiscountResponse =
  | {
      valid: true;
      code: string;
      type: DiscountType;
      value: number;
      discountAmount: number;
      finalPrice: number;
      finalDeposit: number;
      /** A gift voucher (money) rather than a discount code. */
      voucher?: boolean;
    }
  | { valid: false; error: string };
