import type { BookingEntry } from "./bookingStore";

/**
 * Generates a Calendly scheduling link for a booking
 * 
 * Calendly doesn't support programmatically creating events from external bookings.
 * Instead, we generate a personalized scheduling link that the customer can use
 * to confirm their booking time through Calendly.
 * 
 * Required environment variable:
 * - CALENDLY_SCHEDULING_LINK: Your Calendly scheduling link (e.g., https://calendly.com/your-username/event-type)
 * 
 * Optional:
 * - CALENDLY_API_TOKEN: Personal Access Token (for future API enhancements)
 */
export async function createCalendlyEvent(booking: BookingEntry): Promise<string | null> {
  if (!process.env.CALENDLY_SCHEDULING_LINK) {
    console.warn("CALENDLY_SCHEDULING_LINK not set, skipping Calendly integration");
    return null;
  }

  try {
    const baseLink = process.env.CALENDLY_SCHEDULING_LINK;
    
    // Calendly supports pre-filling invitee information via query parameters
    const params = new URLSearchParams();
    
    // Pre-fill name and email if Calendly supports it
    // Note: Calendly's URL parameters vary by plan, but these are commonly supported
    if (booking.name) {
      params.append("name", booking.name);
    }
    if (booking.email) {
      params.append("email", booking.email);
    }
    
    // Add date if provided (format: YYYY-MM-DD)
    if (booking.date) {
      // Ensure date is in YYYY-MM-DD format
      const dateStr = booking.date.includes('T') 
        ? booking.date.split('T')[0] 
        : booking.date;
      params.append("date", dateStr);
    }

    const schedulingLink = params.toString() 
      ? `${baseLink}?${params.toString()}`
      : baseLink;

    console.log("Generated Calendly scheduling link for booking:", booking.email);
    return schedulingLink;
  } catch (error) {
    console.error("Failed to generate Calendly scheduling link:", error);
    return null;
  }
}

/**
 * Alternative function name for consistency
 */
export async function sendCalendlyInvitation(booking: BookingEntry): Promise<string | null> {
  return createCalendlyEvent(booking);
}

