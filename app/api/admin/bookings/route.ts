import { NextResponse } from "next/server";
import Stripe from "stripe";
import { toBookingRows } from "@/lib/admin/bookingRows";

export async function GET(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });
  const { searchParams } = new URL(request.url);
  const startingAfter = searchParams.get("starting_after") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  try {
    const sessions = await stripe.checkout.sessions.list({
      limit,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
      expand: ["data.payment_intent"],
    });

    const bookings = await toBookingRows(sessions.data);

    return NextResponse.json({
      bookings,
      hasMore: sessions.has_more,
      lastId: sessions.data.at(-1)?.id,
    });
  } catch (error) {
    console.error("GET admin bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
