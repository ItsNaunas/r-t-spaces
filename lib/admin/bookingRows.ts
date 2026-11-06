import type Stripe from "stripe";
import { balanceOwed, getBalanceStatuses } from "@/lib/balance";

export type BalanceState = "none" | "owed" | "link_sent" | "paid";

/**
 * One admin row per paid booking. Balance payments are shown on their
 * booking's row (as its balance status), not as bookings of their own.
 * Shared by the admin page and /api/admin/bookings.
 */
export async function toBookingRows(sessions: Stripe.Checkout.Session[]) {
  const paid = sessions.filter((s) => s.payment_status === "paid" && s.metadata?.kind !== "balance");
  const statuses = await getBalanceStatuses(paid.map((s) => s.id)).catch((error) => {
    console.error("Could not load balance statuses:", error);
    return {} as Awaited<ReturnType<typeof getBalanceStatuses>>;
  });

  return paid.map((s) => {
    const status = statuses[s.id];
    const balanceState: BalanceState = status?.paidAt
      ? "paid"
      : !balanceOwed(s)
        ? "none"
        : status?.linkSentAt
          ? "link_sent"
          : "owed";
    return {
      sessionId: s.id,
      customerName: s.metadata?.customerName ?? s.customer_details?.name ?? "—",
      customerEmail: s.metadata?.customerEmail ?? s.customer_email ?? "—",
      bookingDate: s.metadata?.bookingDate ?? "—",
      bookingHours: s.metadata?.bookingHours ?? "—",
      packageTitle: s.metadata?.packageTitle ?? "—",
      totalPrice: s.metadata?.totalPrice ? `£${s.metadata.totalPrice}` : "—",
      depositPaid: `£${((s.amount_total ?? 0) / 100).toFixed(2)}`,
      balanceDue: s.metadata?.balanceDue ? `£${s.metadata.balanceDue}` : "—",
      balanceState,
      balanceAt: status?.paidAt ?? status?.linkSentAt ?? null,
      addonsSummary: s.metadata?.addonsSummary ?? "",
      discountCode: s.metadata?.discountCode ?? "",
      discountAmount: s.metadata?.discountAmount ? `£${s.metadata.discountAmount}` : "",
      paidAt: s.created,
      stripeUrl: `https://dashboard.stripe.com/payments/${typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id}`,
    };
  });
}
