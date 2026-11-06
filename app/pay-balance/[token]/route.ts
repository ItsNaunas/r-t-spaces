import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createBalanceCheckout } from "@/lib/balance";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * The link in the balance email. Opens a fresh Stripe Checkout for whatever
 * is still owed, so the link keeps working however long the customer waits.
 * The token only identifies the booking; the amount comes from Stripe.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.rtspaces.co.uk").replace(/\/$/, "");
  const back = (status: string) => NextResponse.redirect(`${base}/book-online?balance=${status}`, 303);

  const { allowed } = await rateLimit("pay-balance", clientIp(await headers()), 30, 10 * 60);
  if (!allowed) return back("busy");

  try {
    const { token } = await params;
    const result = await createBalanceCheckout(token);
    switch (result.kind) {
      case "redirect":
        return NextResponse.redirect(result.url, 303);
      case "already_paid":
      case "nothing_owed":
        return back("paid");
      default:
        return back("invalid");
    }
  } catch (error) {
    console.error("[BALANCE] could not open balance checkout:", error);
    return back("error");
  }
}
