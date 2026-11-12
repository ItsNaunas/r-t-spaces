import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyCalSignature } from "@/lib/calcom";
import { getPendingBookingByCalUid, cancelPendingBooking } from "@/lib/pendingBookings";
import { getRedis } from "@/lib/redis";
import { confirmCalBooking, getCalBooking } from "@/lib/calcom";
import { displayTimes, getMove, isStudioMove, recordMove } from "@/lib/calMoves";
import { sendStudioNotice } from "@/lib/email";
import { alert } from "@/lib/alerts";

/**
 * Cal.com names both bookings in a reschedule, but which field holds which
 * has varied between versions, so ask Cal.com: the old one is cancelled.
 */
async function handleReschedule(uidA: string, uidB?: string) {
  if (!uidB || uidA === uidB) {
    console.log("Booking rescheduled in Cal.com (one uid only):", uidA);
    return;
  }
  const [a, b] = await Promise.all([getCalBooking(uidA), getCalBooking(uidB)]);
  const aOld = a?.status === "cancelled" || a?.status === "rejected";
  const oldBooking = aOld ? a : b;
  const newBooking = aOld ? b : a;
  if (!oldBooking || !newBooking) {
    console.log("Booking rescheduled in Cal.com, but couldn't read both bookings:", uidA, uidB);
    return;
  }

  // An unpaid hold that was moved stays unpaid: never confirm it for free.
  const hold = await getPendingBookingByCalUid(oldBooking.uid);
  if (hold && hold.status === "pending") {
    console.log("Unpaid hold moved in Cal.com; left unconfirmed:", oldBooking.uid, "->", newBooking.uid);
    return;
  }

  // The studio's own moves (portal) are recorded before Cal.com calls back.
  const byStudio = Boolean(await getMove(oldBooking.uid)) || (await isStudioMove(oldBooking.uid));
  if (!byStudio) {
    await recordMove(oldBooking.uid, { newUid: newBooking.uid, start: newBooking.start, end: newBooking.end, by: "customer" });
  }
  // Event types need confirming, so a moved paid booking would sit unconfirmed.
  if (newBooking.status === "pending" && !(await confirmCalBooking(newBooking.uid))) {
    await alert("calcom-reschedule", "A moved booking couldn't be confirmed in Cal.com", { uid: newBooking.uid });
  }
  if (byStudio) return;

  const was = displayTimes(oldBooking.start, oldBooking.end);
  const now = displayTimes(newBooking.start, newBooking.end);
  const who = newBooking.attendees?.[0];
  await sendStudioNotice(`Booking moved by the customer: ${who?.name ?? "a customer"}`, [
    `${who?.name ?? "A customer"}${who?.email ? ` (${who.email})` : ""} moved their booking in Cal.com.`,
    `Was: ${was.bookingDate}, ${was.bookingHours}`,
    `Now: ${now.bookingDate}, ${now.bookingHours}`,
    "Their payment carries over to the new time. Balance links follow the new date.",
  ]);
}

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
        // A booking moved to a new time (new uid). The deposit still stands.
        await handleReschedule(uid, event.payload?.rescheduleUid);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Cal.com webhook error:", error);
    await alert("calcom-webhook", "A Cal.com webhook failed", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
