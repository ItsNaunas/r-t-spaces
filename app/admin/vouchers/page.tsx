export const dynamic = "force-dynamic";

import { listVouchers } from "@/lib/vouchers";
import { VouchersClient, type VoucherRow } from "./VouchersClient";

export default async function VouchersPage() {
  const vouchers = await listVouchers().catch(() => []);
  const now = new Date().getTime();
  const rows: VoucherRow[] = vouchers.map((v) => ({
    code: v.code,
    amount: v.amountPence / 100,
    left: v.balancePence / 100,
    createdAt: v.createdAt,
    expiresAt: v.expiresAt,
    source: v.source,
    from: v.source === "manual" ? "Complimentary" : v.buyerName || v.buyerEmail,
    to: v.recipientName || v.recipientEmail || "",
    status: v.voidedAt ? "off" : Date.parse(v.expiresAt) <= now ? "expired" : v.balancePence <= 0 ? "used" : "active",
  }));
  const sold = vouchers.filter((v) => v.source === "purchase");
  const soldTotal = sold.reduce((s, v) => s + v.amountPence, 0) / 100;
  const outstanding = rows.filter((r) => r.status === "active").reduce((s, r) => s + r.left, 0);

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Gift vouchers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sold on <a href="/gift-vouchers" className="underline" target="_blank" rel="noopener noreferrer">/gift-vouchers</a>:{" "}
          {sold.length} sold, £{soldTotal.toFixed(2)} taken. £{outstanding.toFixed(2)} is still unspent on active vouchers
          (money owed in studio time: tell your accountant).
        </p>
      </div>
      <VouchersClient vouchers={rows} />
    </div>
  );
}
