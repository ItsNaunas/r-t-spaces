import { NextResponse } from "next/server";
import Stripe from "stripe";

const MEMBERSHIP_TIERS: Record<
  string,
  { name: string; amount: number }
> = {
  essentials: { name: "Essentials Off Peak", amount: 120 },
  signature: { name: "Signature Flex", amount: 250 },
};

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
    });

    const body = await request.json();
    const { tierId } = body;

    const tier = tierId && MEMBERSHIP_TIERS[tierId];
    if (!tier) {
      return NextResponse.json(
        { error: "Invalid or missing tier. Use 'essentials' or 'signature'." },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${baseUrl}/members?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/members?cancelled=true`,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${tier.name} — RT Spaces Membership`,
              description: `Monthly membership. Billed every month. Cancel anytime.`,
            },
            unit_amount: tier.amount * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { tierId },
      },
      metadata: { tierId },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Membership checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
