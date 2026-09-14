import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { cancelExpiredPendingBookings } from "@/lib/pendingBookings";

/**
 * Releases Cal.com holds whose 15-minute payment window has passed.
 *
 * Driven by the Vercel cron in vercel.json (every 5 minutes). Previously this
 * had no caller at all, so unpaid holds blocked the studio's calendar forever.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations.
 * Without that header the endpoint is closed, so a stranger cannot force an
 * early sweep.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET is not set — refusing to run the expiry sweep");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const headersList = await headers();
  if (headersList.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cancelledCount = await cancelExpiredPendingBookings();
    if (cancelledCount > 0) {
      console.log(`Released ${cancelledCount} expired hold(s)`);
    }
    return NextResponse.json({ success: true, cancelledCount });
  } catch (error) {
    console.error("Error cancelling expired bookings:", error);
    return NextResponse.json({ error: "Failed to cancel expired bookings" }, { status: 500 });
  }
}
