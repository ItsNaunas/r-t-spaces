export const dynamic = "force-dynamic";
export const maxDuration = 60;

import Link from "next/link";
import { buildReport, type Report } from "@/lib/admin/report";

const gbp = (n: number) => `${n < 0 ? "-" : ""}£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "short" });

function shift(month: string, by: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const thisMonth = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" }).slice(0, 7);
  const requested = (await searchParams)?.month;
  const month = requested && /^\d{4}-(0[1-9]|1[0-2])$/.test(requested) ? requested : thisMonth;

  let report: Report | null = null;
  try {
    report = await buildReport(month);
  } catch (e) {
    console.error("[ADMIN] report failed", e);
  }

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payments report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every payment in a month (UK time) for your accountant: card, in person, refunds, and gift vouchers used.
          </p>
        </div>
        <a href={`/api/admin/reports/export?month=${month}`} className="border border-gray-900 text-sm px-4 py-2 rounded-md hover:bg-gray-50 whitespace-nowrap">
          Download CSV
        </a>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Link href={`/admin/reports?month=${shift(month, -1)}`} className="border border-gray-200 rounded px-2 py-1 hover:border-gray-900">← Previous</Link>
        <span className="font-semibold text-gray-900">{report?.label ?? month}</span>
        {month < thisMonth && (
          <Link href={`/admin/reports?month=${shift(month, 1)}`} className="border border-gray-200 rounded px-2 py-1 hover:border-gray-900">Next →</Link>
        )}
      </div>

      {!report ? (
        <p className="text-sm text-rose-700">Couldn&apos;t build that report. Refresh to try again.</p>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[
              ["Taken by card", report.cardIn, "deposits, balances, extras, vouchers, memberships"],
              ["Refunded", report.refunds, "back to customers' cards"],
              ["Taken in person", report.inPerson, "as recorded in the portal"],
              ["Gift vouchers used", report.vouchersRedeemed, "not new money: paid when sold"],
            ].map(([label, value, hint]) => (
              <div key={label as string} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1 tabular-nums">{gbp(value as number)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
              </div>
            ))}
          </div>

          {report.byType.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Type", "Count", "Total"].map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.byType.map((t) => (
                    <tr key={t.type}>
                      <td className="px-4 py-2 text-gray-900">{t.type}</td>
                      <td className="px-4 py-2 text-gray-700 tabular-nums">{t.count}</td>
                      <td className="px-4 py-2 text-gray-700 tabular-nums">{gbp(t.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.rows.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">No payments this month.</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Date", "Type", "Customer", "Details", "Amount"].map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.rows.map((r, i) => (
                    <tr key={`${r.ref}-${i}`}>
                      <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{day(r.at)}</td>
                      <td className="px-4 py-2 text-gray-900 whitespace-nowrap">{r.type}</td>
                      <td className="px-4 py-2 text-gray-700">{r.customer || "—"}</td>
                      <td className="px-4 py-2 text-gray-500">{r.description}</td>
                      <td className={`px-4 py-2 tabular-nums whitespace-nowrap ${r.amount < 0 ? "text-rose-700" : r.method === "voucher" ? "text-gray-400" : "text-gray-900"}`}>
                        {gbp(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-gray-400">
            Card payments arrive in your bank from Stripe minus Stripe&apos;s fees, which are in the Stripe dashboard. Unspent
            gift voucher balances are money held for future studio time.
          </p>
        </>
      )}
    </div>
  );
}
