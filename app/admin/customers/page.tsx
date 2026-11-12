export const dynamic = "force-dynamic";

import { CustomersTable } from "./CustomersTable";
import { loadCustomers } from "@/lib/admin/customers";

export default async function CustomersPage() {
  const customers = await loadCustomers();
  const repeat = customers.filter((c) => c.bookings > 1).length;
  const total = customers.reduce((sum, c) => sum + c.totalPaid, 0);

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Everyone who has booked in the last 2 years: {customers.length} customers, {repeat} booked more than once,
            £{total.toFixed(2)} paid in total (before refunds).
          </p>
        </div>
        <a
          href="/api/admin/customers/export"
          className="border border-gray-900 text-sm px-4 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap"
        >
          Download CSV
        </a>
      </div>
      <CustomersTable customers={customers} />
      <p className="text-xs text-gray-400">
        Only email people about offers if they&apos;ve agreed to hear from you, for example through the Creator Circle
        signup.
      </p>
    </div>
  );
}
