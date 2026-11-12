import { customersCsv, loadCustomers } from "@/lib/admin/customers";

export const dynamic = "force-dynamic";

/** Download the customer list as a CSV (for promos to past customers). */
export async function GET() {
  const csv = customersCsv(await loadCustomers());
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rt-spaces-customers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
