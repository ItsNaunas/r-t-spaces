import type Stripe from "stripe";
import { balanceOwed, getBalanceStatuses, IN_PERSON, type BalanceStatus } from "@/lib/balance";
import { manualOwed, type ManualBooking } from "@/lib/manualBookings";

export type BalanceState = "none" | "owed" | "link_sent" | "paid" | "refunded";

export type BookingRow = {
  /** Stripe Checkout session id, or the manual booking's "manual_" id. */
  sessionId: string;
  kind: "online" | "manual";
  customerName: string;
  customerEmail: string;
  phone: string;
  bookingDate: string;
  bookingHours: string;
  /** ISO, when known; sorts the table. */
  start: string | null;
  packageTitle: string;
  totalPrice: string;
  depositPaid: string;
  balanceDue: string;
  balanceState: BalanceState;
  balanceAt: string | null;
  /** True when the balance was marked paid in person rather than online. */
  balancePaidInPerson: boolean;
  addonsSummary: string;
  discountCode: string;
  discountAmount: string;
  source: string;
  campaign: string;
  notes: string;
  /** Unix seconds: when it was paid for (online) or added (manual). */
  paidAt: number;
  cancelled: boolean;
  stripeUrl: string | null;
  /** Its Cal.com booking(s); block bookings have one per day. */
  calBookingUids: string[];
};

const pounds = (n: number) => `£${n.toFixed(2)}`;

function balanceState(owed: number, status: BalanceStatus | null | undefined): BalanceState {
  if (status?.paidAt) return "paid";
  if (!owed) return "none";
  if (status?.refundedAt) return "refunded";
  return status?.linkSentAt ? "link_sent" : "owed";
}

/**
 * One admin row per paid booking. Balance payments are shown on their
 * booking's row (as its balance status), not as bookings of their own.
 * Shared by the admin pages and /api/admin/bookings.
 */
export async function toBookingRows(sessions: Stripe.Checkout.Session[]): Promise<BookingRow[]> {
  const paid = sessions.filter((s) => s.payment_status === "paid" && s.metadata?.kind !== "balance");
  const statuses = await getBalanceStatuses(paid.map((s) => s.id)).catch((error) => {
    console.error("Could not load balance statuses:", error);
    return {} as Awaited<ReturnType<typeof getBalanceStatuses>>;
  });

  return paid.map((s) => {
    const status = statuses[s.id];
    const intent = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id;
    return {
      sessionId: s.id,
      kind: "online",
      customerName: s.metadata?.customerName ?? s.customer_details?.name ?? "—",
      customerEmail: s.metadata?.customerEmail ?? s.customer_email ?? "—",
      phone: s.customer_details?.phone ?? "",
      bookingDate: s.metadata?.bookingDate ?? "—",
      bookingHours: s.metadata?.bookingHours ?? "—",
      start: s.metadata?.sessionStart || null,
      packageTitle: s.metadata?.packageTitle ?? "—",
      totalPrice: s.metadata?.totalPrice ? `£${s.metadata.totalPrice}` : "—",
      depositPaid: pounds((s.amount_total ?? 0) / 100),
      balanceDue: s.metadata?.balanceDue ? `£${s.metadata.balanceDue}` : "—",
      balanceState: balanceState(balanceOwed(s), status),
      balanceAt: status?.paidAt ?? status?.refundedAt ?? status?.linkSentAt ?? null,
      balancePaidInPerson: status?.paidSessionId === IN_PERSON,
      addonsSummary: s.metadata?.addonsSummary ?? "",
      discountCode: s.metadata?.discountCode ?? "",
      discountAmount: s.metadata?.discountAmount ? `£${s.metadata.discountAmount}` : "",
      // Empty for bookings made before attribution was added.
      source: s.metadata?.source ?? "",
      campaign: s.metadata?.campaign ?? "",
      notes: s.metadata?.bookingNotes ?? "",
      paidAt: s.created,
      cancelled: false,
      stripeUrl: intent ? `https://dashboard.stripe.com/payments/${intent}` : null,
      calBookingUids: (s.metadata?.calBookingUids || s.metadata?.calBookingUid || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
    };
  });
}

/** Rows for the bookings the studio added by hand. */
export async function manualBookingRows(bookings: ManualBooking[]): Promise<BookingRow[]> {
  const statuses = await getBalanceStatuses(bookings.map((b) => b.id)).catch(
    () => ({}) as Awaited<ReturnType<typeof getBalanceStatuses>>
  );
  return bookings.map((b) => {
    const status = statuses[b.id];
    const owedAtBooking = Math.max(0, b.totalPrice - b.paidUpfront);
    return {
      sessionId: b.id,
      kind: "manual",
      customerName: b.name,
      customerEmail: b.email || "—",
      phone: b.phone,
      bookingDate: b.bookingDate,
      bookingHours: b.bookingHours,
      start: b.start,
      packageTitle: b.packageTitle,
      totalPrice: pounds(b.totalPrice),
      depositPaid: pounds(b.paidUpfront),
      balanceDue: owedAtBooking ? pounds(owedAtBooking) : "—",
      balanceState: b.paidInFullAt && owedAtBooking ? "paid" : balanceState(manualOwed(b), status),
      balanceAt: b.paidInFullAt ?? status?.linkSentAt ?? null,
      balancePaidInPerson: Boolean(b.paidInFullAt) && status?.paidSessionId === IN_PERSON,
      addonsSummary: "",
      discountCode: "",
      discountAmount: "",
      source: "manual",
      campaign: "",
      notes: b.notes,
      paidAt: Math.floor(Date.parse(b.createdAt) / 1000),
      cancelled: Boolean(b.cancelledAt),
      stripeUrl: null,
      calBookingUids: [b.calBookingUid],
    };
  });
}
