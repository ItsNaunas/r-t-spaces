/** Membership tiers sold through /api/checkout/membership. */
export const MEMBERSHIP_TIERS: Record<string, { name: string; amount: number }> = {
  essentials: { name: "Essentials Off Peak", amount: 120 },
  signature: { name: "Signature Flex", amount: 250 },
};
