export const dynamic = "force-dynamic";

import { BookingsTable } from "./BookingsTable";
import { AddBookingForm, type PackageOption } from "./AddBookingForm";
import { loadBookingRows } from "@/lib/admin/loadBookings";
import { getMergedPackages } from "@/lib/admin/pricing-merged";

export default async function BookingsPage() {
  const [bookings, packages] = await Promise.all([loadBookingRows(), getMergedPackages()]);
  const options: PackageOption[] = packages
    .filter((p) => !p.id.startsWith("block-"))
    .map((p) => ({
      id: p.id,
      title: p.enabled ? p.title : `${p.title} (hidden on the website)`,
      hours: p.hours,
      priceFromTime: Boolean(p.priceFromTime),
      minimumHours: p.minimumHours ?? 2,
    }));

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paid online bookings from the last 6 months, plus bookings added here. Balance links are emailed to
          customers 2 days before their session, with a reminder the day before if it&apos;s still unpaid.
        </p>
      </div>
      <AddBookingForm packages={options} />
      <BookingsTable bookings={bookings} />
    </div>
  );
}
