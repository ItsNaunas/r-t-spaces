export const dynamic = "force-dynamic";

import { listActivity } from "@/lib/activity";
import { lastCronSuccess, listAlerts } from "@/lib/alerts";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function ActivityPage() {
  const [entries, alerts, cronOk] = await Promise.all([
    listActivity(300).catch(() => []),
    listAlerts().catch(() => []),
    lastCronSuccess().catch(() => null),
  ]);

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          What&apos;s been done in the portal, and anything that went wrong. Everyone shares one login, so this shows
          what and when, not who.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Problems (last 14 days)</h2>
        <p className="text-xs text-gray-500 mb-3">
          Daily 08:00 job last finished cleanly: {cronOk ? when(cronOk) : "not yet recorded"}.
          {process.env.ALERT_EMAIL ? " Problems are also emailed." : " Set ALERT_EMAIL to have problems emailed."}
        </p>
        {alerts.length === 0 ? (
          <p className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-emerald-700">Nothing has gone wrong.</p>
        ) : (
          <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {alerts.map((a, i) => (
              <li key={`${a.at}-${i}`} className="px-4 py-3">
                <div className="flex flex-wrap gap-x-3 text-sm">
                  <span className="text-gray-400 tabular-nums whitespace-nowrap">{when(a.at)}</span>
                  <span className="text-rose-700 font-medium">{a.message}</span>
                  <span className="text-xs text-gray-400">{a.kind}</span>
                </div>
                {a.detail && (
                  <details className="mt-1">
                    <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                    <pre className="mt-1 text-xs text-gray-600 whitespace-pre-wrap break-all">{a.detail}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Actions</h2>
        {entries.length === 0 ? (
          <p className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-400">Nothing recorded yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["When", "What happened", "Amount"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e, i) => (
                  <tr key={`${e.at}-${i}`}>
                    <td className="px-4 py-2 text-gray-400 tabular-nums whitespace-nowrap">{when(e.at)}</td>
                    <td className="px-4 py-2 text-gray-800">{e.summary}</td>
                    <td className="px-4 py-2 text-gray-700 tabular-nums whitespace-nowrap">{e.amount ? `£${e.amount.toFixed(2)}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
