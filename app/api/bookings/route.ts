import { NextResponse } from "next/server";
import { saveBooking } from "@/lib/bookingStore";
import { sendBookingNotification } from "@/lib/email";

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

    const bookingEntry = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      date: date ? String(date) : undefined,
      hours: hours ? String(hours) : undefined,
      notes: notes ? String(notes).replace(/<[^>]*>/g, '').trim() : undefined,
    };

    // Save booking
    const savedBooking = await saveBooking(bookingEntry);

    // Send email notifications (non-blocking - don't fail if email fails)
    sendBookingNotification(savedBooking).catch((error) => {
      console.error("Email notification failed (booking still saved):", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Unable to save booking. Please try again later." },
      { status: 500 },
    );
  }
}

