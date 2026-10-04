import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getPromotion } from "@/lib/promotionStore";
import { BLOCK_EVENT_PACKAGE_ID, addDaysToKey, isPromotionLive } from "@/lib/promotion";
import { getAvailableSlots, getEventTypeId } from "@/lib/calcom";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 62;

/**
 * Free full-day start times for block bookings, by date:
 * GET /api/promotion/slots?from=2026-10-05&to=2026-11-30
 */
export async function GET(request: Request) {
  try {
    const { allowed } = await rateLimit("promo-slots", clientIp(await headers()), 60, 10 * 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    if (!isPromotionLive(await getPromotion())) {
      return NextResponse.json({ error: "Block bookings are not available right now." }, { status: 404 });
    }

    const url = new URL(request.url);
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";
    if (!DATE.test(from) || !DATE.test(to)) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }
    const span = (Date.parse(to) - Date.parse(from)) / 86400000;
    if (!(span >= 0 && span <= MAX_RANGE_DAYS)) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const eventTypeId = await getEventTypeId(BLOCK_EVENT_PACKAGE_ID);
    if (!eventTypeId) {
      console.error(`Cal.com event type "${BLOCK_EVENT_PACKAGE_ID}" not found`);
      return NextResponse.json({ error: "Online booking is being set up." }, { status: 503 });
    }

    const all = await getAvailableSlots(eventTypeId, from, addDaysToKey(to, 1));
    // The end was padded a day in case Cal.com treats it as exclusive; trim back.
    const dates = Object.fromEntries(Object.entries(all).filter(([d]) => d >= from && d <= to));
    return NextResponse.json({ dates });
  } catch (error) {
    console.error("GET promotion slots error:", error);
    return NextResponse.json({ error: "Could not load available dates." }, { status: 500 });
  }
}
