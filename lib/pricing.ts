export const PRICING_CONFIG = {
  hourlyRate: 55, // £55 per hour (standard rate)
  minimumHours: 2,
  depositPercentage: 0.5, // 50% deposit
};

export type BookingPackage = {
  id: string;
  title: string;
  price: number; // in pounds
  duration: string;
  hours: number; // calculated hours
  popular?: boolean;
  includes: string[];
};

export const BOOKING_PACKAGES: BookingPackage[] = [
  {
    id: "standard-rate",
    title: "Standard Rate",
    price: 110, // minimum (2 hrs × £55) — actual price from selected time
    duration: "£55/hr (min 2 hrs)",
    hours: 2,
    popular: false,
    includes: [
      "Minimum 2 hours booking",
      "Equipment & studio access",
      "Complimentary snacks and drinks",
    ],
  },
  {
    id: "half-day",
    title: "Half-Day Hire",
    price: 260,
    duration: "5 hours",
    hours: 5,
    popular: false,
    includes: [
      "5 hours · Monday–Friday",
      "Lighting kit + tether station",
      "Pre-set backgrounds + props",
      "Complimentary snacks and drinks",
    ],
  },
  {
    id: "full-day",
    title: "Full-Day Hire",
    price: 450,
    duration: "9 hours",
    hours: 9,
    popular: true,
    includes: [
      "9 hours · any day",
      "Lighting, grip, and crew support",
      "Load-in assistance + storage",
      "Complimentary snacks and drinks",
    ],
  },
];

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
 * Calculate total price based on hours
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
 * Calculate balance due (remaining 50%)
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
    // Try to extract times from string like "8 AM – 2 PM" or "8:00 AM – 2:00 PM"
    const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi;
    const matches = [...hoursStr.matchAll(timePattern)];
    
    if (matches.length < 2) {
      return null;
    }

    const startMatch = matches[0];
    const endMatch = matches[1];

    const startHour = parseInt(startMatch[1]);
    const startMinute = parseInt(startMatch[2] || '0');
    const startPeriod = startMatch[3].toUpperCase();
    
    const endHour = parseInt(endMatch[1]);
    const endMinute = parseInt(endMatch[2] || '0');
    const endPeriod = endMatch[3].toUpperCase();

    // Convert to 24-hour format
    let start24 = startHour === 12 ? 0 : startHour;
    if (startPeriod === 'PM' && startHour !== 12) start24 += 12;
    
    let end24 = endHour === 12 ? 0 : endHour;
    if (endPeriod === 'PM' && endHour !== 12) end24 += 12;

    // Calculate difference
    const startMinutes = start24 * 60 + startMinute;
    const endMinutes = end24 * 60 + endMinute;
    
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
      // Handle overnight bookings (e.g., 11 PM - 2 AM)
      diffMinutes += 24 * 60;
    }

    return Math.max(Math.ceil(diffMinutes / 60), PRICING_CONFIG.minimumHours);
  } catch (error) {
    console.error('Error parsing hours string:', error);
    return null;
  }
}

