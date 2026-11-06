import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { releaseUnpaidHold } from "@/lib/pendingBookings";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * The wizard calls this when a customer picks a time and then changes
 * package, so the abandoned slot frees up straight away instead of blocking
 * the calendar. releaseUnpaidHold refuses anything that reached checkout.
 */
export async function POST(request: Request) {
  const { allowed } = await rateLimit("hold-release", clientIp(await headers()), 20, 10 * 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const uid = typeof body?.calBookingUid === "string" ? body.calBookingUid : "";
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(uid)) {
    return NextResponse.json({ error: "Missing booking reference" }, { status: 400 });
  }

  try {
    const released = await releaseUnpaidHold(uid);
    return NextResponse.json({ released });
  } catch (error) {
    console.error("Error releasing hold:", error);
    return NextResponse.json({ error: "Failed to release hold" }, { status: 500 });
  }
}
