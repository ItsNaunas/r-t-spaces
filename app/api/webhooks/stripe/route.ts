import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createCalendarEvent } from "@/lib/calendar";
import { sendBookingNotification } from "@/lib/email";
import type { BookingEntry } from "@/lib/bookingStore";
import { promises as fs } from "fs";
import path from "path";

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

// Helper function to validate booking entry
function isValidBookingEntry(booking: unknown): booking is BookingEntry {
  return (
    typeof booking === "object" &&
    booking !== null &&
    "name" in booking &&
    "email" in booking &&
    "createdAt" in booking &&
    typeof (booking as { name: unknown }).name === "string" &&
    typeof (booking as { email: unknown }).email === "string" &&
    typeof (booking as { createdAt: unknown }).createdAt === "string"
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: {
        bookingId?: string;
        name?: string;
        email?: string;
        date?: string;
        hours?: string;
      };
      payment_intent?: string;
    };

    try {
      // Get booking details from metadata
      const { bookingId } = session.metadata || {};

      if (!bookingId) {
        console.error("No bookingId in session metadata");
        return NextResponse.json({ received: true });
      }

      // Load booking from file
      const raw = await fs.readFile(bookingsFile, "utf-8");
      const bookings = JSON.parse(raw) as unknown[];
      const booking = bookings.find(
        (b): b is BookingEntry => {
          if (!isValidBookingEntry(b)) return false;
          return b.createdAt === bookingId;
        },
      );

      if (!booking) {
        console.error("Booking not found:", bookingId);
        return NextResponse.json({ received: true });
      }

      // Validate booking has required fields
      if (!isValidBookingEntry(booking)) {
        console.error("Invalid booking entry structure:", bookingId);
        return NextResponse.json({ received: true });
      }

      // Update booking status to confirmed
      booking.status = "confirmed";
      booking.paymentIntentId = session.payment_intent;
      booking.paidAt = new Date().toISOString();

      await fs.writeFile(
        bookingsFile,
        JSON.stringify(bookings, null, 2),
        "utf-8",
      );

      // Create calendar event
      try {
        const calendarEvent = await createCalendarEvent(booking);
        if (calendarEvent?.id) {
          booking.calendarEventId = calendarEvent.id;
          await fs.writeFile(
            bookingsFile,
            JSON.stringify(bookings, null, 2),
            "utf-8",
          );
        }
        console.log("Calendar event created for booking:", bookingId);
      } catch (calendarError) {
        console.error("Failed to create calendar event:", calendarError);
        // Don't fail the webhook if calendar fails
      }

      // Send confirmation emails
      try {
        await sendBookingNotification(booking);
        console.log("Confirmation emails sent for booking:", bookingId);
      } catch (emailError) {
        console.error("Failed to send confirmation emails:", emailError);
        // Don't fail the webhook if email fails
      }
    } catch (error) {
      console.error("Error processing booking confirmation:", error);
      // Return success to Stripe so it doesn't retry
      return NextResponse.json({ received: true });
    }
  }

  return NextResponse.json({ received: true });
}

