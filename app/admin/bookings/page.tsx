export const dynamic = "force-dynamic";

import Stripe from "stripe";
import { BookingsTable } from "./BookingsTable";
import { toBookingRows } from "@/lib/admin/bookingRows";

async function getBookings() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) return [];

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" });

  const sessions = await stripe.checkout.sessions.list({
    limit: 100,
    expand: ["data.payment_intent"],
  });

  return toBookingRows(sessions.data);
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Confirmed paid bookings from Stripe. Last 100 sessions. Balance links are emailed to
          customers 2 days before their session.
        </p>
      </div>
      <BookingsTable bookings={bookings} />
    </div>
  );
}
