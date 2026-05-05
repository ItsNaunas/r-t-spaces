import Stripe from "stripe";
import { BookingsTable } from "./BookingsTable";

async function getBookings() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) return [];

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });

  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    expand: ["data.payment_intent"],
  });

  return sessions.data
    .filter((s) => s.payment_status === "paid")
    .map((s) => ({
      sessionId: s.id,
      customerName: s.metadata?.customerName ?? s.customer_details?.name ?? "—",
      customerEmail: s.metadata?.customerEmail ?? s.customer_email ?? "—",
      bookingDate: s.metadata?.bookingDate ?? "—",
      bookingHours: s.metadata?.bookingHours ?? "—",
      packageTitle: s.metadata?.packageTitle ?? "—",
      totalPrice: s.metadata?.totalPrice ? `£${s.metadata.totalPrice}` : "—",
      depositPaid: `£${((s.amount_total ?? 0) / 100).toFixed(2)}`,
      balanceDue: s.metadata?.balanceDue ? `£${s.metadata.balanceDue}` : "—",
      addonsSummary: s.metadata?.addonsSummary ?? "",
      discountCode: s.metadata?.discountCode ?? "",
      discountAmount: s.metadata?.discountAmount ? `£${s.metadata.discountAmount}` : "",
      paidAt: s.created,
      stripeUrl: `https://dashboard.stripe.com/payments/${typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent as Stripe.PaymentIntent)?.id}`,
    }));
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Confirmed paid bookings from Stripe. Last 100 sessions.
        </p>
      </div>
      <BookingsTable bookings={bookings} />
    </div>
  );
}
