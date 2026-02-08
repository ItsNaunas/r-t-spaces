export const PRICING_CONFIG = {
  hourlyRate: 55,
  minimumHours: 2,
  depositPercentage: 0.5, // 50% deposit for standard packages
};

export type BookingPackage = {
  id: string;
  title: string;
  price: number; // in pounds
  duration: string;
  hours: number;
  popular?: boolean;
  includes: string[];
  /** e.g. "solo portraits, couples, headshots" */
  bestFor?: string;
  /** e.g. "Package available Monday to Thursday" */
  availabilityNote?: string;
  /** When set, deposit is fixed instead of 50% */
  depositAmount?: number;
  /** When set with depositAmount, balance due on day */
  balanceOnDay?: number;
  /** Show a "Limited offer" badge (e.g. seasonal packages) */
  limitedOffer?: boolean;
};

export const BOOKING_PACKAGES: BookingPackage[] = [
  {
    id: "essential-studio",
    title: "Essential Studio Session",
    price: 110,
    duration: "2 Hours | Up to 2 People | 5 Edited Images",
    hours: 2,
    popular: false,
    includes: [
      "2-hour studio session",
      "Up to 2 people",
      "5 professionally edited digital images",
      "One studio backdrop",
      "Private online gallery",
    ],
    bestFor: "solo portraits, couples, headshots",
    availabilityNote: "Package available Monday to Thursday",
  },
  {
    id: "signature-studio",
    title: "Signature Studio Session",
    price: 165,
    duration: "3 Hours | Up to 4 People | 10 Edited Images",
    hours: 3,
    popular: true,
    includes: [
      "3-hour studio session",
      "Up to 4 people",
      "10 professionally edited digital images",
      "Outfit changes included",
      "Private online gallery",
    ],
    bestFor: "couples, families, personal branding",
    availabilityNote: "Package available Monday to Thursday",
  },
  {
    id: "luxury-studio",
    title: "Luxury Studio Experience",
    price: 220,
    duration: "4 Hours | Up to 6 People | 15 Edited Images",
    hours: 4,
    popular: false,
    includes: [
      "4-hour studio session",
      "Up to 6 people",
      "15 professionally edited digital images",
      "Multiple outfit changes",
      "Priority editing",
      "Print credit included",
    ],
    bestFor: "engagements, maternity, luxury branding",
    availabilityNote: "Package available Monday to Thursday",
  },
  {
    id: "engagement-story",
    title: "Engagement Story",
    price: 200,
    duration: "3 Hours | 15 Edited Images",
    hours: 3,
    popular: false,
    includes: [
      "3-hour studio session",
      "15 edited digital images",
      "Styling & posing guidance",
      "Priority editing",
    ],
    bestFor: "engagement sessions",
    availabilityNote: "Package available Monday to Thursday",
  },
  {
    id: "mothers-day-mini",
    title: "Mother's Day Mini Session",
    price: 65,
    duration: "1 Hour | Mum + up to 3 children | 5 Edited Images",
    hours: 1,
    popular: false,
    includes: [
      "1-hour studio session",
      "Mum + up to 3 children",
      "5 professionally edited digital images",
      "Soft, neutral Mother's Day setup",
      "Professional posing & guidance",
      "Private online gallery",
      "Complimentary 5×7 print for Mum",
    ],
    availabilityNote: "Available for a limited time only · In-Studio",
    depositAmount: 25,
    balanceOnDay: 40,
    limitedOffer: true,
  },
  {
    id: "mothers-day-premium",
    title: "Mother's Day Premium Experience",
    price: 95,
    duration: "1.5 Hours | Mum + up to 5 people | 10 Edited Images",
    hours: 1.5,
    popular: false,
    includes: [
      "1.5-hour studio session",
      "Mum + up to 5 people",
      "10 professionally edited digital images",
      "Multiple backdrops",
      "Outfit change included",
      "Priority editing",
      "Complimentary print for Mum",
    ],
    availabilityNote: "Available for a limited time only",
    depositAmount: 35,
    balanceOnDay: 60,
    limitedOffer: true,
  },
];

export type PricingAddon = {
  id: string;
  label: string;
  price?: number; // in pounds; undefined = "available upon request"
  /** e.g. "image", "person", "hour" for quantity-based add-ons */
  unit?: string;
};

export const ADDONS: PricingAddon[] = [
  { id: "extra-image", label: "Extra edited image", price: 10, unit: "image" },
  { id: "full-gallery", label: "Full gallery upgrade", price: 50 },
  { id: "additional-hour", label: "Additional hour", price: 55, unit: "hour" },
  { id: "extra-people", label: "Extra people", price: 15, unit: "person" },
  { id: "prints-albums", label: "Prints & albums", price: undefined },
];

export type SelectedAddon = { id: string; quantity?: number };

/**
 * Compute add-ons total and summary string. Quantity defaults to 1 for add-ons without unit.
 * Prints & albums (no price) is not included in total.
 */
export function computeAddonsTotal(
  selected: SelectedAddon[]
): { total: number; summary: string } {
  const addonMap = new Map(ADDONS.map((a) => [a.id, a]));
  let total = 0;
  const parts: string[] = [];
  for (const { id, quantity = 1 } of selected) {
    const addon = addonMap.get(id);
    if (!addon || addon.price == null || quantity <= 0) continue;
    const addonTotal = addon.price * quantity;
    total += addonTotal;
    parts.push(
      quantity > 1
        ? `${quantity}× ${addon.label} (£${addonTotal})`
        : `${addon.label} (£${addonTotal})`
    );
  }
  return { total, summary: parts.join(", ") || "" };
}

/**
 * Get deposit for a package. Uses fixed depositAmount when set, otherwise 50% of total.
 */
export function getDepositForPackage(
  pkg: BookingPackage,
  totalPrice: number
): number {
  if (pkg.depositAmount != null) {
    return pkg.depositAmount;
  }
  return calculateDeposit(totalPrice);
}

/**
 * Get balance due (on the day) for a package. Uses balanceOnDay when set with fixed deposit, otherwise total - deposit.
 */
export function getBalanceForPackage(
  pkg: BookingPackage,
  totalPrice: number,
  deposit: number
): number {
  if (pkg.balanceOnDay != null) {
    return pkg.balanceOnDay;
  }
  return totalPrice - deposit;
}

/**
 * Calculate hours between two times
 */
export function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(Math.ceil(diffHours), PRICING_CONFIG.minimumHours);
}

/**
 * Calculate total price based on hours (for hourly-based bookings)
 */
export function calculatePrice(hours: number): number {
  return hours * PRICING_CONFIG.hourlyRate;
}

/**
 * Calculate deposit amount (50% of total)
 */
export function calculateDeposit(totalPrice: number): number {
  return totalPrice * PRICING_CONFIG.depositPercentage;
}

/**
 * Calculate balance due (total minus deposit)
 */
export function calculateBalance(totalPrice: number, deposit: number): number {
  return totalPrice - deposit;
}

/**
 * Parse hours string like "8 AM – 2 PM" to hours
 * Returns null if parsing fails
 */
export function parseHoursString(hoursStr: string): number | null {
  try {
    const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi;
    const matches = [...hoursStr.matchAll(timePattern)];

    if (matches.length < 2) {
      return null;
    }

    const startMatch = matches[0];
    const endMatch = matches[1];

    const startHour = parseInt(startMatch[1]);
    const startMinute = parseInt(startMatch[2] || "0");
    const startPeriod = startMatch[3].toUpperCase();

    const endHour = parseInt(endMatch[1]);
    const endMinute = parseInt(endMatch[2] || "0");
    const endPeriod = endMatch[3].toUpperCase();

    let start24 = startHour === 12 ? 0 : startHour;
    if (startPeriod === "PM" && startHour !== 12) start24 += 12;

    let end24 = endHour === 12 ? 0 : endHour;
    if (endPeriod === "PM" && endHour !== 12) end24 += 12;

    const startMinutes = start24 * 60 + startMinute;
    const endMinutes = end24 * 60 + endMinute;

    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    return Math.max(
      Math.ceil(diffMinutes / 60),
      PRICING_CONFIG.minimumHours
    );
  } catch (error) {
    console.error("Error parsing hours string:", error);
    return null;
  }
}
