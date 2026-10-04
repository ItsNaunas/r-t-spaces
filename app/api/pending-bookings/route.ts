import { NextResponse } from "next/server";
import { savePendingBooking, getPendingBookingByCalUid } from "@/lib/pendingBookings";
import { getCalBooking } from "@/lib/calcom";

/**
 * Records a 15-minute hold against a Cal.com booking that is awaiting payment.
 *
 * The GET and PATCH handlers that used to live here were removed: PATCH let
 * anyone mark a hold "confirmed" with no payment and no auth, which also meant
 * the slot was never released. Confirmation now happens in exactly one place,
 * the Stripe webhook.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { calBookingUid, packageId, packageTitle, totalPrice, depositAmount, addonsTotal, addonsSummary } =
      body ?? {};

    if (typeof calBookingUid !== "string" || !calBookingUid) {
      return NextResponse.json({ error: "Missing booking reference" }, { status: 400 });
    }

    // Verify the booking with Cal.com rather than trusting the browser. This
    // also supplies the authoritative times and attendee details.
    const booking = await getCalBooking(calBookingUid);
    if (!booking || booking.status !== "pending") {
      return NextResponse.json({ error: "That time slot is not being held" }, { status: 400 });
    }

    // Idempotent: the wizard can re-fire this effect, and a duplicate hold for
    // the same slot would leave an orphan record the expiry job would act on.
    const existing = await getPendingBookingByCalUid(calBookingUid);
    if (existing) return NextResponse.json(existing);

    const attendee = booking.attendees?.[0];
    if (!attendee?.name || !attendee?.email) {
      return NextResponse.json({ error: "Booking is missing attendee details" }, { status: 400 });
    }

    const pendingBooking = await savePendingBooking({
      id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      calBookingUid,
      customerName: attendee.name,
      customerEmail: attendee.email,
      startTime: booking.start,
      endTime: booking.end,
      bookingData: {
        packageId: typeof packageId === "string" ? packageId : undefined,
        packageTitle: typeof packageTitle === "string" ? packageTitle : undefined,
        // Display-only. Nothing charged is ever read from these.
        totalPrice: Number.isFinite(Number(totalPrice)) ? Number(totalPrice) : undefined,
        depositAmount: Number.isFinite(Number(depositAmount)) ? Number(depositAmount) : undefined,
        addonsTotal: Number.isFinite(Number(addonsTotal)) ? Number(addonsTotal) : undefined,
        addonsSummary: typeof addonsSummary === "string" ? addonsSummary : undefined,
      },
    });

    return NextResponse.json(pendingBooking);
  } catch (error) {
    console.error("Error creating pending booking:", error);
    return NextResponse.json({ error: "Failed to create pending booking" }, { status: 500 });
  }
}
