import Stripe from "stripe";
import { getCancelledFlags } from "@/lib/admin/bookingActions";
import { manualBookingRows, toBookingRows, type BookingRow } from "@/lib/admin/bookingRows";
import { listManualBookings } from "@/lib/manualBookings";
import { listExtras } from "@/lib/extras";
import { getMoves, resolveCalUid } from "@/lib/calMoves";
import { getCustomerNotes } from "@/lib/customerNotes";

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
  const online = rows.filter((r) => r.kind === "online");
  const [cancelled, extras, moves, notes] = await Promise.all([
    getCancelledFlags(online.map((r) => r.sessionId)).catch(() => new Set<string>()),
    listExtras(rows.map((r) => r.sessionId)).catch(() => ({}) as Awaited<ReturnType<typeof listExtras>>),
    getMoves(online.flatMap((r) => r.calBookingUids)).catch(() => ({}) as Awaited<ReturnType<typeof getMoves>>),
    getCustomerNotes(rows.map((r) => r.customerEmail)).catch(() => ({}) as Awaited<ReturnType<typeof getCustomerNotes>>),
  ]);

  const out: BookingRow[] = [];
  for (const r of rows) {
    const row: BookingRow = { ...r, cancelled: r.cancelled || cancelled.has(r.sessionId) };
    row.extras = (extras[r.sessionId] ?? []).map((e) => ({
      id: e.id,
      amount: e.amount,
      reason: e.reason,
      paid: Boolean(e.paidAt),
      inPerson: e.paidVia === "in-person",
    }));
    // A moved online booking: show its new time (Stripe still has the old one).
    if (r.kind === "online" && r.calBookingUids.length === 1 && moves[r.calBookingUids[0]]) {
      const { move } = await resolveCalUid(r.calBookingUids[0]);
      if (move) Object.assign(row, { bookingDate: move.bookingDate, bookingHours: move.bookingHours, start: move.start, moved: true });
    }
    const note = notes[r.customerEmail.toLowerCase()];
    row.customerNoShows = note?.noShows.length ?? 0;
    row.noShowHere = Boolean(note?.noShows.some((n) => n.bookingId === r.sessionId));
    out.push(row);
  }
  return out.sort((a, b) => b.paidAt - a.paidAt);
}
