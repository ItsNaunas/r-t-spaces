import Stripe from "stripe";
import { getCancelledFlags } from "@/lib/admin/bookingActions";
import { manualBookingRows, toBookingRows, type BookingRow } from "@/lib/admin/bookingRows";
import { listManualBookings } from "@/lib/manualBookings";

const DAY = 24 * 60 * 60 * 1000;

function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key?.startsWith("sk_") ? new Stripe(key, { apiVersion: "2025-11-17.clover" }) : null;
}

/**
 * Every Checkout session created in the last `days` (bookings, balances,
 * memberships), newest first. Capped so a page load can't run away.
 */
export async function recentSessions(days: number, cap = 1000): Promise<Stripe.Checkout.Session[]> {
  const s = stripe();
  if (!s) return [];
  return s.checkout.sessions
    .list({
      created: { gte: Math.floor((Date.now() - days * DAY) / 1000) },
      limit: 100,
      expand: ["data.payment_intent"],
    })
    .autoPagingToArray({ limit: cap });
}

/** Online and manual bookings together, newest booked first, with cancellations marked. */
export async function loadBookingRows(days = 180): Promise<BookingRow[]> {
  const [sessions, manual] = await Promise.all([
    recentSessions(days),
    listManualBookings(new Date(Date.now() - days * DAY), new Date(Date.now() + 730 * DAY)),
  ]);
  const rows = [...(await toBookingRows(sessions)), ...(await manualBookingRows(manual))];
  const cancelled = await getCancelledFlags(rows.filter((r) => r.kind === "online").map((r) => r.sessionId)).catch(
    () => new Set<string>()
  );
  return rows
    .map((r) => (cancelled.has(r.sessionId) ? { ...r, cancelled: true } : r))
    .sort((a, b) => b.paidAt - a.paidAt);
}
