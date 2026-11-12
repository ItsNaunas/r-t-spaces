import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { attributionMetadata } from "@/lib/attribution";
import { VOUCHER_MAX, VOUCHER_MIN } from "@/lib/vouchers";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Start a Stripe Checkout for a gift voucher. The voucher itself is created
 * only once Stripe says it is paid (finalizePaidSession, kind "voucher").
 */
export async function POST(request: Request) {
  try {
    const { allowed } = await rateLimit("voucher-checkout", clientIp(await headers()), 10, 10 * 60);
    if (!allowed) return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
      return NextResponse.json({ error: "Payments are not available right now." }, { status: 500 });
    }

    const body = ((await request.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
    const amount = Math.round(Number(body.amount));
    const buyerName = str(body.buyerName, 100);
    const buyerEmail = str(body.buyerEmail, 200).toLowerCase();
    const recipientName = str(body.recipientName, 100);
    const recipientEmail = str(body.recipientEmail, 200).toLowerCase();
    const message = str(body.message, 300);

    if (!Number.isInteger(amount) || amount < VOUCHER_MIN || amount > VOUCHER_MAX) {
      return NextResponse.json({ error: `Choose an amount from £${VOUCHER_MIN} to £${VOUCHER_MAX}.` }, { status: 400 });
    }
    if (!buyerName || !EMAIL.test(buyerEmail)) {
      return NextResponse.json({ error: "Enter your name and email." }, { status: 400 });
    }
    if (recipientEmail && !EMAIL.test(recipientEmail)) {
      return NextResponse.json({ error: "The recipient's email doesn't look right." }, { status: 400 });
    }

    const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.rtspaces.co.uk").replace(/\/$/, "");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `RT Spaces gift voucher: £${amount}`,
              description: "Studio time, valid for 12 months. The code is emailed straight after payment.",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      customer_email: buyerEmail,
      success_url: `${base}/book-online?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/gift-vouchers`,
      metadata: {
        kind: "voucher",
        amount: String(amount),
        buyerName,
        buyerEmail,
        recipientName,
        recipientEmail,
        message,
        ...attributionMetadata(request),
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Voucher checkout error:", error);
    return NextResponse.json({ error: "Couldn't start the payment. Please try again." }, { status: 500 });
  }
}
