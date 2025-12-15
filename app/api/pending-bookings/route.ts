import { NextResponse } from "next/server";
import { savePendingBooking, getPendingBookingByStripeSession, confirmPendingBooking, cancelExpiredPendingBookings } from "@/lib/pendingBookings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      calendlyEventUri,
      calendlyInviteeUri,
      customerName,
      customerEmail,
      startTime,
      endTime,
      packageId,
      packageTitle,
      totalPrice,
      depositAmount,
    } = body;

    if (!calendlyEventUri || !customerName || !customerEmail || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pendingBooking = await savePendingBooking({
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      calendlyEventUri,
      calendlyInviteeUri,
      customerName,
      customerEmail,
      startTime,
      endTime,
      bookingData: {
        packageId,
        packageTitle,
        totalPrice,
        depositAmount,
      },
    });

    return NextResponse.json(pendingBooking);
  } catch (error) {
    console.error("Error creating pending booking:", error);
    return NextResponse.json(
      { error: "Failed to create pending booking" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get("stripeSessionId");
    
    if (stripeSessionId) {
      const booking = await getPendingBookingByStripeSession(stripeSessionId);
      if (!booking) {
        return NextResponse.json({ error: "Pending booking not found" }, { status: 404 });
      }
      return NextResponse.json(booking);
    }
    
    // If no params, cancel expired bookings (cleanup job)
    const cancelledCount = await cancelExpiredPendingBookings();
    return NextResponse.json({ cancelledCount });
  } catch (error) {
    console.error("Error getting pending booking:", error);
    return NextResponse.json(
      { error: "Failed to get pending booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing required fields: id, action" },
        { status: 400 }
      );
    }
    
    if (action === "confirm") {
      const confirmed = await confirmPendingBooking(id);
      if (!confirmed) {
        return NextResponse.json({ error: "Pending booking not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating pending booking:", error);
    return NextResponse.json(
      { error: "Failed to update pending booking" },
      { status: 500 }
    );
  }
}

