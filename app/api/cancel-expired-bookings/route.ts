import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { cancelExpiredPendingBookings } from "@/lib/pendingBookings";
import { sendDueBalanceLinks } from "@/lib/balance";

// Paging Stripe sessions and sending emails can take a little while.
export const maxDuration = 60;

/**
 * Releases Cal.com holds whose payment window has passed, and emails the
 * balance payment links that have come due (see lib/balance.ts).
 *
 * A daily backstop (Vercel cron in vercel.json; Hobby allows daily only). The
 * Stripe checkout.session.expired webhook releases holds within ~30 minutes;
 * this catches any it missed. Previously this
 * had no caller at all, so unpaid holds blocked the studio's calendar forever.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled invocations.
 * Without that header the endpoint is closed, so a stranger cannot force an
 * early sweep.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET is not set — refusing to run the expiry sweep");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const headersList = await headers();
  if (headersList.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Two independent daily jobs share this one cron (Hobby allows daily crons
  // only): one failing must not stop the other.
  const [expiry, balance] = await Promise.allSettled([
    cancelExpiredPendingBookings(),
    sendDueBalanceLinks(),
  ]);

  if (expiry.status === "fulfilled" && expiry.value > 0) {
    console.log(`Released ${expiry.value} expired hold(s)`);
  }
  if (expiry.status === "rejected") console.error("Error cancelling expired bookings:", expiry.reason);
  if (balance.status === "fulfilled") console.log("[BALANCE] daily run:", balance.value);
  if (balance.status === "rejected") console.error("[BALANCE] daily run failed:", balance.reason);

  const ok = expiry.status === "fulfilled" && balance.status === "fulfilled";
  return NextResponse.json(
    {
      success: ok,
      cancelledCount: expiry.status === "fulfilled" ? expiry.value : null,
      balanceLinks: balance.status === "fulfilled" ? balance.value : null,
    },
    { status: ok ? 200 : 500 }
  );
}
