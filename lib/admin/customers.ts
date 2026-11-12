import { getBalanceStatuses, IN_PERSON, balanceOwed } from "@/lib/balance";
import { listManualBookings, type ManualBooking } from "@/lib/manualBookings";
import { recentSessions } from "@/lib/admin/loadBookings";
import { NOT_BOOKINGS } from "@/lib/admin/bookingRows";
import { getCustomerNotes } from "@/lib/customerNotes";

export type Customer = {
  email: string;
  name: string;
  phone: string;
  bookings: number;
  /** Pounds, before refunds. */
  totalPaid: number;
  firstAt: string;
  lastAt: string;
  sources: string[];
  member: boolean;
  /** The studio's private notes, and how many no-shows they've had. */
  notes: string;
  noShows: number;
};

const HISTORY_DAYS = 730;
const DAY = 24 * 60 * 60 * 1000;

/**
 * Everyone who has paid or been booked in by hand over the last two years,
 * one row per email address. Online bookings, balances and first membership
 * payments come from Stripe; manual bookings add what was taken in person.
 */
export async function loadCustomers(): Promise<Customer[]> {
  const [sessions, manual] = await Promise.all([
    recentSessions(HISTORY_DAYS, 3000),
    listManualBookings(new Date(Date.now() - HISTORY_DAYS * DAY), new Date(Date.now() + 730 * DAY)),
  ]);
  const paid = sessions.filter((s) => s.payment_status === "paid");
  const statuses = await getBalanceStatuses([
    ...paid.filter((s) => !NOT_BOOKINGS.includes(s.metadata?.kind ?? "")).map((s) => s.id),
    ...manual.map((b) => b.id),
  ]).catch(() => ({}) as Awaited<ReturnType<typeof getBalanceStatuses>>);

  const byEmail = new Map<string, Customer>();
  const touch = (email: string, at: string, patch: (c: Customer) => void) => {
    const key = email.trim().toLowerCase();
    if (!key || key === "—") return;
    const c =
      byEmail.get(key) ??
      ({ email: key, name: "", phone: "", bookings: 0, totalPaid: 0, firstAt: at, lastAt: at, sources: [], member: false, notes: "", noShows: 0 } as Customer);
    if (at < c.firstAt) c.firstAt = at;
    if (at >= c.lastAt) c.lastAt = at;
    patch(c);
    byEmail.set(key, c);
  };

  for (const s of paid) {
    const m = s.metadata ?? {};
    const email = m.customerEmail || s.customer_details?.email || s.customer_email || "";
    const at = new Date(s.created * 1000).toISOString();
    const amount = (s.amount_total ?? 0) / 100;
    touch(email, at, (c) => {
      c.name = c.name || m.customerName || s.customer_details?.name || "";
      c.phone = c.phone || s.customer_details?.phone || "";
      c.totalPaid += amount;
      if (m.source && !c.sources.includes(m.source)) c.sources.push(m.source);
      if (s.mode === "subscription") c.member = true;
      else if (!NOT_BOOKINGS.includes(m.kind ?? "")) {
        c.bookings += 1;
        // A balance marked paid in person never went through Stripe.
        if (statuses[s.id]?.paidSessionId === IN_PERSON) c.totalPaid += balanceOwed(s);
      }
    });
  }

  for (const b of manual as ManualBooking[]) {
    if (b.cancelledAt) continue;
    const inPerson = statuses[b.id]?.paidSessionId === IN_PERSON ? Math.max(0, b.totalPrice - b.paidUpfront) : 0;
    touch(b.email, b.createdAt, (c) => {
      c.name = c.name || b.name;
      c.phone = c.phone || b.phone;
      c.bookings += 1;
      // Voucher-paid bookings: the money was counted when the voucher was sold.
      c.totalPaid += (b.via === "voucher" ? 0 : b.paidUpfront) + inPerson;
      if (b.source && !c.sources.includes(b.source)) c.sources.push(b.source);
    });
  }

  const notes = await getCustomerNotes([...byEmail.keys()]).catch(() => ({}) as Awaited<ReturnType<typeof getCustomerNotes>>);
  return [...byEmail.values()]
    .map((c) => ({
      ...c,
      totalPaid: Math.round(c.totalPaid * 100) / 100,
      notes: notes[c.email]?.notes ?? "",
      noShows: notes[c.email]?.noShows.length ?? 0,
    }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

/** CSV with the usual quoting, and formula-looking cells defused for Excel. */
export function customersCsv(customers: Customer[]): string {
  const cell = (v: string | number | boolean) => {
    let s = String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Name", "Email", "Phone", "Bookings", "Total paid (GBP)", "First booked", "Last booked", "Sources", "Member", "No-shows"];
  const lines = customers.map((c) =>
    [c.name, c.email, c.phone, c.bookings, c.totalPaid.toFixed(2), c.firstAt.slice(0, 10), c.lastAt.slice(0, 10), c.sources.join(" "), c.member ? "yes" : "", c.noShows || ""]
      .map(cell)
      .join(",")
  );
  return [header.join(","), ...lines].join("\r\n");
}
