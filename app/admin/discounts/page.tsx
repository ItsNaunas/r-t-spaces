export const dynamic = "force-dynamic";

import { getAllDiscountCodes } from "@/lib/admin/kv";
import { DiscountsClient } from "./DiscountsClient";
import { BOOKING_PACKAGES, HIRE_RATE_IDS } from "@/lib/pricing";

export default async function DiscountsPage() {
  const codes = await getAllDiscountCodes();
  const packages = BOOKING_PACKAGES.map((p) => ({
    id: p.id,
    title: p.title,
    group: (HIRE_RATE_IDS.includes(p.id) ? "Studio Hire" : "Photo Sessions") as "Photo Sessions" | "Studio Hire",
  }));
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Discount Codes</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage discount codes for bookings.</p>
      </div>
      <DiscountsClient initialCodes={codes} packages={packages} />
    </div>
  );
}
