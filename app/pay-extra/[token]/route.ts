import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createExtraCheckout } from "@/lib/extras";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { alert } from "@/lib/alerts";

export const dynamic = "force-dynamic";

/**
 * The link in an extra-charge email. Like /pay-balance: a fresh Stripe
 * Checkout per click, priced on the server from the stored charge.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.rtspaces.co.uk").replace(/\/$/, "");
  const back = (status: string) => NextResponse.redirect(`${base}/book-online?balance=${status}`, 303);

  const { allowed } = await rateLimit("pay-extra", clientIp(await headers()), 30, 10 * 60);
  if (!allowed) return back("busy");

  try {
    const { token } = await params;
    const result = await createExtraCheckout(token);
    if (result.kind === "redirect") return NextResponse.redirect(result.url, 303);
    return back(result.kind === "already_paid" ? "paid" : "invalid");
  } catch (error) {
    await alert("pay-extra", "Couldn't open a checkout for an extra charge", error);
    return back("error");
  }
}
