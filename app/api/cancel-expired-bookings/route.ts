import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { cancelExpiredPendingBookings } from "@/lib/pendingBookings";
import { sendDueBalanceLinks } from "@/lib/balance";
import { sendAbandonedFollowUps, sendReviewRequests } from "@/lib/followUps";
import { alert, markCronSuccess } from "@/lib/alerts";

// Paging Stripe sessions and sending emails can take a little while.
export const maxDuration = 60;

/**
 * Releases Cal.com holds whose payment window has passed, emails the balance
 * payment links that have come due (lib/balance.ts), and sends the
 * abandoned-booking and review follow-ups (lib/followUps.ts).
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

  // Independent daily jobs share this one cron (Hobby allows daily crons
  // only): one failing must not stop the others. The sweep runs first so the
  // holds it releases get their follow-up in the same run.
  const expiry = await Promise.allSettled([cancelExpiredPendingBookings()]).then((r) => r[0]);
  const [balance, abandoned, reviews] = await Promise.allSettled([
    sendDueBalanceLinks(),
    sendAbandonedFollowUps(),
    sendReviewRequests(),
  ]);
  for (const [name, result] of [["abandoned", abandoned], ["reviews", reviews]] as const) {
    if (result.status === "fulfilled") console.log(`[FOLLOWUP] ${name}:`, result.value);
    else console.error(`[FOLLOWUP] ${name} failed:`, result.reason);
  }

  if (expiry.status === "fulfilled" && expiry.value > 0) {
    console.log(`Released ${expiry.value} expired hold(s)`);
  }
  if (expiry.status === "rejected") console.error("Error cancelling expired bookings:", expiry.reason);
  if (balance.status === "fulfilled") console.log("[BALANCE] daily run:", balance.value);
  if (balance.status === "rejected") console.error("[BALANCE] daily run failed:", balance.reason);

  const ok = [expiry, balance, abandoned, reviews].every((r) => r.status === "fulfilled");

  // Anything that failed, whole job or single email, goes to the alert email.
  const named = { "release holds": expiry, "balance links": balance, "abandoned follow-ups": abandoned, "review requests": reviews };
  const problems: string[] = [];
  for (const [name, result] of Object.entries(named)) {
    if (result.status === "rejected") problems.push(`${name} failed: ${String(result.reason).slice(0, 300)}`);
    else if (typeof result.value === "object" && result.value && "failed" in result.value && Number(result.value.failed) > 0) {
      problems.push(`${name}: ${result.value.failed} failed`);
    }
  }
  if (problems.length) await alert("daily-job", `The daily 08:00 job had problems: ${problems.join("; ")}`.slice(0, 300));
  else await markCronSuccess().catch(() => {});
  return NextResponse.json(
    {
      success: ok,
      cancelledCount: expiry.status === "fulfilled" ? expiry.value : null,
      balanceLinks: balance.status === "fulfilled" ? balance.value : null,
      abandonedFollowUps: abandoned.status === "fulfilled" ? abandoned.value : null,
      reviewRequests: reviews.status === "fulfilled" ? reviews.value : null,
    },
    { status: ok ? 200 : 500 }
  );
}
