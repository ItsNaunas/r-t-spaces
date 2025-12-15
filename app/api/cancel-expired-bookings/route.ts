import { NextResponse } from "next/server";
import { cancelExpiredPendingBookings } from "@/lib/pendingBookings";

/**
 * API endpoint to cancel expired pending bookings
 * This should be called periodically (e.g., via cron job or scheduled task)
 * 
 * For Vercel, you can set up a cron job in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cancel-expired-bookings",
 *     "schedule": "every 5 minutes"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    const cancelledCount = await cancelExpiredPendingBookings();
    return NextResponse.json({ 
      success: true, 
      cancelledCount,
      message: `Cancelled ${cancelledCount} expired pending booking(s)`
    });
  } catch (error) {
    console.error("Error cancelling expired bookings:", error);
    return NextResponse.json(
      { error: "Failed to cancel expired bookings" },
      { status: 500 }
    );
  }
}

