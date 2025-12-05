import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createCalendarEvent } from "@/lib/calendar";
import { sendBookingNotification } from "@/lib/email";
import { promises as fs } from "fs";
import path from "path";

const bookingsFile = path.join(process.cwd(), "data", "bookings.json");

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      // Get booking details from metadata
      const { bookingId, name, email, date, hours } = session.metadata;

      // Load booking from file
      const raw = await fs.readFile(bookingsFile, "utf-8");
      const bookings = JSON.parse(raw);
      const booking = bookings.find(
        (b: any) => b.createdAt === bookingId,
      );

      if (!booking) {
        console.error("Booking not found:", bookingId);
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

