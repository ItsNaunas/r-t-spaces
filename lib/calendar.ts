import { google } from "googleapis";
import type { BookingEntry } from "./bookingStore";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getAuthClient() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Calendar credentials not configured");
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });

  return auth;
}

export async function createCalendarEvent(booking: BookingEntry) {
  if (!process.env.GOOGLE_CALENDAR_ID) {
    console.warn("GOOGLE_CALENDAR_ID not set, skipping calendar event creation");
    return null;
  }

  try {
    const auth = getAuthClient();
    const calendar = google.calendar({ version: "v3", auth });

    // Parse the booking date and hours
    const startDate = booking.date ? new Date(booking.date) : new Date();
    const endDate = new Date(startDate);

    // Parse hours to determine end time
    if (booking.hours) {
      const hourMatch = booking.hours.match(/(\d+)\s*hours?/i);
      if (hourMatch) {
        const hourCount = parseInt(hourMatch[1], 10);
        endDate.setHours(startDate.getHours() + hourCount);
      } else {
        // Try to parse time range
        const timeRangeMatch = booking.hours.match(/(\d+)\s*(AM|PM).*?(\d+)\s*(AM|PM)/i);
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

          startDate.setHours(start, 0, 0, 0);
          endDate.setHours(end, 0, 0, 0);
        } else {
          // Default to 2 hours if can't parse
          endDate.setHours(startDate.getHours() + 2);
        }
      }
    } else {
      // Default to 2 hours if no hours specified
      endDate.setHours(startDate.getHours() + 2);
    }

    const event = {
      summary: `Studio Booking: ${booking.name}`,
      description: `Booking from ${booking.name} (${booking.email})\n\n${booking.notes || "No additional notes"}`,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Europe/London",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Europe/London",
      },
      attendees: [
        { email: booking.email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "popup", minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
      sendUpdates: "all", // Send invites to attendees
    });

    return response.data;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    throw error;
  }
}



