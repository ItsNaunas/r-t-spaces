import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Pricing configuration
export const PRICING = {
  // Base hourly rate
  hourlyRate: 50, // £50 per hour (in pence, so 5000 = £50.00)
  
  // Package rates (optional - can be customized)
  packages: {
    halfDay: 20000, // £200 for 4 hours
    fullDay: 35000, // £350 for 8 hours
  },
};

export function calculatePrice(hours: string): number {
  // Parse hours string (e.g., "8 AM – 2 PM" or "4 hours")
  const hourMatch = hours.match(/(\d+)\s*hours?/i);
  if (hourMatch) {
    const hourCount = parseInt(hourMatch[1], 10);
    return hourCount * PRICING.hourlyRate;
  }
  
  // Try to parse time range (e.g., "8 AM – 2 PM" = 6 hours)
  const timeRangeMatch = hours.match(/(\d+)\s*(AM|PM).*?(\d+)\s*(AM|PM)/i);
  if (timeRangeMatch) {
    const startHour = parseInt(timeRangeMatch[1], 10);
    const startPeriod = timeRangeMatch[2].toUpperCase();
    const endHour = parseInt(timeRangeMatch[3], 10);
    const endPeriod = timeRangeMatch[4].toUpperCase();
    
    let start = startHour;
    if (startPeriod === "PM" && startHour !== 12) start += 12;
    if (startPeriod === "AM" && startHour === 12) start = 0;
    
    let end = endHour;
    if (endPeriod === "PM" && endHour !== 12) end += 12;
    if (endPeriod === "AM" && endHour === 12) end = 0;
    
    const hourCount = end - start;
    if (hourCount > 0) {
      return hourCount * PRICING.hourlyRate;
    }
  }
  
  // Default to minimum 2 hours if can't parse
  return 2 * PRICING.hourlyRate;
}

