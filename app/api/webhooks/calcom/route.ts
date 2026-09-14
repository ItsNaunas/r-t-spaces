import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyCalSignature } from "@/lib/calcom";
import { getPendingBookingByCalUid, cancelPendingBooking } from "@/lib/pendingBookings";
import { getRedis } from "@/lib/redis";

/**
 * Receives booking events from Cal.com so the site stays in step when a
 * customer cancels or reschedules from Cal.com's own emails rather than
 * through us.
 *
 * Every payload is HMAC-verified. An unverified request is rejected outright —
 * this endpoint is public, and booking state is not something a stranger gets
 * to change.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.CAL_WEBHOOK_SECRET) {
      console.error("CAL_WEBHOOK_SECRET is not set — rejecting Cal.com webhook");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const raw = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-cal-signature-256");

    if (!(await verifyCalSignature(raw, signature))) {
      console.error("Cal.com webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(raw) as {
      triggerEvent?: string;
      payload?: { uid?: string; bookingId?: number; rescheduleUid?: string };
    };

    const trigger = event.triggerEvent;
    const uid = event.payload?.uid;
    if (!trigger || !uid) {
      return NextResponse.json({ received: true });
    }

    // Idempotency: Cal.com retries, and cancelling twice would be harmless but
    // noisy. Claim each (trigger, uid) pair once.
    const redis = getRedis();
    const claimed = await redis.set(`cal:evt:${trigger}:${uid}`, "1", {
      nx: true,
      ex: 60 * 60 * 24,
    });
    if (claimed === null) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (trigger) {
      case "BOOKING_CANCELLED":
      case "BOOKING_REJECTED": {
        const pending = await getPendingBookingByCalUid(uid);
        if (pending) {
          // Already gone in Cal.com, so only our own record needs updating.
          // cancelPendingBooking is a no-op against Cal.com for a booking that
          // is no longer pending.
          await cancelPendingBooking(pending.id, "Cancelled in Cal.com");
          console.log("Pending hold released after Cal.com cancellation:", pending.id);
        }
        break;
      }

      case "BOOKING_RESCHEDULED": {
        // The customer moved an already-paid booking. The deposit still stands;
        // the studio just needs to know. Surfaced in logs until bookings carry
        // a status record of their own.
        console.log("Booking rescheduled in Cal.com:", {
          from: uid,
          to: event.payload?.rescheduleUid,
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cal.com webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
