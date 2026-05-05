import { NextResponse } from "next/server";
import Stripe from "stripe";

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

    const bookings = sessions.data
      .filter((s) => s.payment_status === "paid")
      .map((s) => ({
        sessionId: s.id,
        customerName: s.metadata?.customerName ?? s.customer_details?.name ?? "—",
        customerEmail: s.metadata?.customerEmail ?? s.customer_email ?? "—",
        bookingDate: s.metadata?.bookingDate ?? "—",
        bookingHours: s.metadata?.bookingHours ?? "—",
        packageTitle: s.metadata?.packageTitle ?? "—",
        totalPrice: s.metadata?.totalPrice ? `£${s.metadata.totalPrice}` : "—",
        depositPaid: `£${((s.amount_total ?? 0) / 100).toFixed(2)}`,
        balanceDue: s.metadata?.balanceDue ? `£${s.metadata.balanceDue}` : "—",
        addonsSummary: s.metadata?.addonsSummary ?? "",
        discountCode: s.metadata?.discountCode ?? "",
        discountAmount: s.metadata?.discountAmount ? `£${s.metadata.discountAmount}` : "",
        paidAt: s.created,
        stripeUrl: `https://dashboard.stripe.com/payments/${typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id}`,
      }));

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
