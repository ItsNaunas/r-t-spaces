import { NextResponse } from "next/server";
import { stripe, calculatePrice } from "@/lib/stripe";
import { saveBooking } from "@/lib/bookingStore";

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, date, hours, notes } = body ?? {};

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email." },
        { status: 400 },
      );
    }

    // Calculate price based on hours
    const amount = hours ? calculatePrice(hours) : 2 * 5000; // Default 2 hours if no hours specified

    // Create booking entry (will be confirmed after payment)
    const bookingEntry = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      date: date ? String(date) : undefined,
      hours: hours ? String(hours) : undefined,
      notes: notes ? String(notes) : undefined,
    };

    // Save booking as pending (will be confirmed via webhook)
    const booking = await saveBooking(bookingEntry);

    // Format date safely for description
    let dateDescription = "";
    if (bookingEntry.date) {
      try {
        const date = new Date(bookingEntry.date);
        if (!isNaN(date.getTime())) {
          dateDescription = ` on ${date.toLocaleDateString()}`;
        }
      } catch {
        // Invalid date, skip date in description
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Studio Booking",
              description: `Studio booking for ${bookingEntry.name}${dateDescription}${bookingEntry.hours ? ` (${bookingEntry.hours})` : ""}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/book-online?canceled=true`,
      customer_email: bookingEntry.email,
      metadata: {
        bookingId: booking.createdAt, // Use timestamp as ID
        name: bookingEntry.name,
        email: bookingEntry.email,
        date: bookingEntry.date || "",
        hours: bookingEntry.hours || "",
      },
    });

    if (!session.url) {
      throw new Error("Stripe session URL is missing");
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Unable to create checkout session. Please try again later." },
      { status: 500 },
    );
  }
}

