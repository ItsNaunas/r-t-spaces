export type DiscountType = "percentage" | "fixed";

export type DiscountCode = {
  code: string;
  type: DiscountType;
  value: number;
  scope: "global" | string;
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
    }
  | { valid: false; error: string };
