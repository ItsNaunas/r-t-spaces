import Stripe from "stripe";
import { getRedis } from "./redis";
import { getCalBooking } from "./calcom";
import { listAbandonedHolds } from "./abandoned";
import { londonDay, subjectFromSession, type BalanceSubject } from "./balance";
import { listManualBookings } from "./manualBookings";
import { sendAbandonedBookingEmail, sendReviewRequestEmail } from "./email";

/**
 * Two daily follow-up emails, run by the same cron as the balance links:
 *
 * - "Still want to book?" to people whose hold was released unpaid in the
 *   last two days, unless they have booked since. At most one per address
 *   every two weeks, however many times they try.
 * - A Google review request the day after a session (online or manual,
 *   not cancelled). Off until GOOGLE_REVIEW_URL is set.
 */

const DAY = 24 * 60 * 60 * 1000;
const ABANDONED_WINDOW_MS = 2 * DAY;
const ABANDONED_PER_EMAIL_SECONDS = 14 * 24 * 60 * 60;
const REVIEW_LOOKBACK_DAYS = 120;
const KEEP_SECONDS = 60 * 60 * 24 * 30;

const log = (msg: string, ...rest: unknown[]) => console.log(`[FOLLOWUP] ${msg}`, ...rest);

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) throw new Error("Stripe is not configured");
  return new Stripe(key, { apiVersion: "2025-11-17.clover" });
}

/** Has this address booked (paid online, or been booked in by hand) since `since`? */
async function bookedSince(email: string, since: Date, manualEmails: Set<string>): Promise<boolean> {
  if (manualEmails.has(email)) return true;
  const sessions = await stripe().checkout.sessions.list({
    customer_details: { email },
    created: { gte: Math.floor(since.getTime() / 1000) },
    limit: 20,
  });
  return sessions.data.some((s) => s.payment_status === "paid");
}

export async function sendAbandonedFollowUps(now: Date = new Date()) {
  const holds = await listAbandonedHolds(new Date(now.getTime() - ABANDONED_WINDOW_MS), now);
  const manual = await listManualBookings(new Date(now.getTime() - ABANDONED_WINDOW_MS), new Date(now.getTime() + 365 * DAY));
  const manualEmails = new Set(manual.filter((b) => !b.cancelledAt).map((b) => b.email.toLowerCase()).filter(Boolean));
  const redis = getRedis();

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const hold of holds) {
    const sentKey = `followup:abandoned:sent:${hold.id}`;
    const emailKey = `followup:abandoned:email:${hold.email}`;
    try {
      if ((await redis.get(sentKey)) || (await redis.get(emailKey))) {
        skipped++;
        continue;
      }
      // An hour's slack: they may have started a second checkout before the first one expired.
      if (await bookedSince(hold.email, new Date(Date.parse(hold.heldAt) - 60 * 60 * 1000), manualEmails)) {
        await redis.set(sentKey, "booked", { ex: KEEP_SECONDS });
        skipped++;
        continue;
      }
      await sendAbandonedBookingEmail({
        name: hold.name || "there",
        email: hold.email,
        packageTitle: hold.packageTitle,
        bookingDate: new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "full" }).format(
          new Date(hold.start)
        ),
      });
      await redis.set(sentKey, now.toISOString(), { ex: KEEP_SECONDS });
      await redis.set(emailKey, hold.id, { ex: ABANDONED_PER_EMAIL_SECONDS });
      log("abandoned follow-up sent:", hold.id);
      sent++;
    } catch (error) {
      failed++;
      console.error("[FOLLOWUP] abandoned follow-up failed:", hold.id, error);
    }
  }
  return { checked: holds.length, sent, skipped, failed };
}

/** Start time for a subject, asking Cal.com only when it isn't stored. */
async function startOf(subject: BalanceSubject): Promise<{ start: string | null; cancelled: boolean }> {
  const booking = subject.calBookingUid ? await getCalBooking(subject.calBookingUid) : null;
  return {
    start: subject.start || booking?.start || null,
    cancelled: booking?.status === "cancelled" || booking?.status === "rejected",
  };
}

export async function sendReviewRequests(now: Date = new Date()) {
  const reviewUrl = process.env.GOOGLE_REVIEW_URL;
  if (!reviewUrl?.startsWith("https://")) return { skipped: "GOOGLE_REVIEW_URL is not set" as const };

  const yesterday = londonDay(new Date(now.getTime() - DAY));
  const sessions = await stripe()
    .checkout.sessions.list({
      created: { gte: Math.floor(now.getTime() / 1000) - REVIEW_LOOKBACK_DAYS * 24 * 60 * 60 },
      limit: 100,
    })
    .autoPagingToArray({ limit: 2000 });
  const manual = await listManualBookings(new Date(now.getTime() - 3 * DAY), now);

  const candidates: { id: string; name: string; email: string; start?: string; calBookingUid?: string }[] = [
    ...sessions
      .map(subjectFromSession)
      .filter((s): s is BalanceSubject => Boolean(s?.email))
      .map((s) => ({ id: s.id, name: s.name, email: s.email!, start: s.start, calBookingUid: s.calBookingUid })),
    ...manual
      .filter((b) => !b.cancelledAt && b.emailCustomer && b.email)
      .map((b) => ({ id: b.id, name: b.name, email: b.email, start: b.start, calBookingUid: b.calBookingUid })),
  ];

  const redis = getRedis();
  const emailed = new Set<string>();
  let sent = 0;
  let failed = 0;
  for (const c of candidates) {
    // Stored starts can rule a booking out without asking Cal.com.
    if (c.start && londonDay(new Date(c.start)) !== yesterday) continue;
    const key = `followup:review:${c.id}`;
    const email = c.email.toLowerCase();
    try {
      if (emailed.has(email) || (await redis.get(key))) continue;
      const { start, cancelled } = await startOf({ ...c, owed: 0 });
      if (!start || cancelled || londonDay(new Date(start)) !== yesterday) continue;
      await sendReviewRequestEmail({ name: c.name || "there", email, reviewUrl });
      await redis.set(key, now.toISOString(), { ex: KEEP_SECONDS });
      emailed.add(email);
      log("review request sent:", c.id);
      sent++;
    } catch (error) {
      failed++;
      console.error("[FOLLOWUP] review request failed:", c.id, error);
    }
  }
  return { sent, failed };
}
