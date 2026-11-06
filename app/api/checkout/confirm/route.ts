import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { resolveCheckout } from "@/lib/checkoutOutcome";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * Called by client pages (the members page) when Stripe sends the customer
 * back, as a backstop for the webhook. Only a session id comes in; the
 * session is fetched from Stripe and only a paid one is ever acted on, so a
 * made-up or replayed id does nothing.
 */
export async function POST(request: Request) {
  const { allowed } = await rateLimit("checkout-confirm", clientIp(await headers()), 20, 10 * 60);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;
  const outcome = await resolveCheckout(sessionId);
  return NextResponse.json({ outcome });
}
