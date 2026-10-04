import { NextResponse } from "next/server";
import { getPromotion } from "@/lib/promotionStore";
import { toPublicPromotion } from "@/lib/promotion";

// Admin-editable and time-boxed, so it must be read per request.
export const dynamic = "force-dynamic";

/** The live special offer, for the pop-up and the booking wizard. */
export async function GET() {
  try {
    return NextResponse.json(toPublicPromotion(await getPromotion()));
  } catch (error) {
    console.error("GET promotion error:", error);
    return NextResponse.json({ live: false });
  }
}
