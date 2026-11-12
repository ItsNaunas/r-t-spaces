export const dynamic = "force-dynamic";

import {
  analyticsConfigured,
  breakdown,
  countryName,
  daily,
  deviceName,
  HISTORY_DAYS,
  labelled,
  pageName,
  totals,
  type Point,
} from "@/lib/webAnalytics";
import { sourceFromReferrer } from "@/lib/attribution";
import { recentSessions } from "@/lib/admin/loadBookings";
import { listManualBookings } from "@/lib/manualBookings";

const DAY = 24 * 60 * 60 * 1000;
const gbp = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function TopList({ title, rows, unit = "visitors" }: { title: string; rows: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-700 truncate">{r.label}</span>
                <span className="text-gray-500 tabular-nums">{r.value.toLocaleString("en-GB")}</span>
              </div>
              <div className="h-1.5 mt-1 rounded bg-gray-100" aria-hidden>
                <div className="h-1.5 rounded bg-gray-800" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only">Values are {unit}.</p>
    </div>
  );
}

function DailyChart({ points }: { points: Point[] }) {
  const max = Math.max(1, ...points.map((p) => p.visitors));
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Visitors per day</h2>
        <span className="text-xs text-gray-400">busiest day: {max}</span>
      </div>
      <div className="mt-4 flex items-end gap-[3px] h-32" role="img" aria-label="Visitors per day over the last 30 days">
        {points.map((p) => (
          <div
            key={p.date}
            title={`${new Date(`${p.date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}: ${p.visitors} visitors`}
            className="flex-1 rounded-t bg-gray-800 hover:bg-gray-500 min-h-[2px]"
            style={{ height: `${(p.visitors / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{points[0] && new Date(`${points[0].date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

async function bookingStats(since: Date) {
  const [sessions, manual] = await Promise.all([
    recentSessions(HISTORY_DAYS + 1),
    listManualBookings(new Date(since.getTime() - 365 * DAY), new Date(Date.now() + 730 * DAY)),
  ]);
  const paid = sessions.filter((s) => s.payment_status === "paid" && s.created * 1000 >= since.getTime());
  const deposits = paid.filter((s) => s.mode === "payment" && s.metadata?.kind !== "balance");
  const takenOnline = paid.reduce((sum, s) => sum + (s.amount_total ?? 0) / 100, 0);

  const bySource = new Map<string, { bookings: number; value: number }>();
  const add = (source: string, value: number) => {
    const row = bySource.get(source) ?? { bookings: 0, value: 0 };
    row.bookings += 1;
    row.value += value;
    bySource.set(source, row);
  };
  for (const s of deposits) {
    add(s.metadata?.source || "not tracked yet", Number(s.metadata?.totalPrice) || (s.amount_total ?? 0) / 100);
  }
  const manualInRange = manual.filter((b) => !b.cancelledAt && Date.parse(b.createdAt) >= since.getTime());
  for (const b of manualInRange) add("added by hand", b.totalPrice);

  return {
    bookings: deposits.length + manualInRange.length,
    takenOnline,
    bookedValue: [...bySource.values()].reduce((sum, r) => sum + r.value, 0),
    bySource: [...bySource.entries()].map(([source, r]) => ({ source, ...r })).sort((a, b) => b.bookings - a.bookings),
  };
}

export default async function AnalyticsPage() {
  const now = new Date();
  // The API rounds to whole days: pass tomorrow's midnight or today is dropped.
  const until = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const since = new Date(until.getTime() - HISTORY_DAYS * DAY);

  const stats = await bookingStats(since).catch((e) => {
    console.error("[ADMIN] analytics: booking stats failed", e);
    return null;
  });

  let traffic: Awaited<ReturnType<typeof loadTraffic>> | null = null;
  let trafficError = "";
  if (analyticsConfigured()) {
    try {
      traffic = await loadTraffic(since, until);
    } catch (e) {
      console.error("[ADMIN] analytics: Vercel query failed", e);
      trafficError = "Couldn't load website traffic from Vercel right now.";
    }
  }

  const conversion = traffic && stats && traffic.totals.visitors ? (stats.bookings / traffic.totals.visitors) * 100 : null;

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">The last {HISTORY_DAYS} days. Traffic is updated hourly.</p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card label="Visitors" value={traffic ? traffic.totals.visitors.toLocaleString("en-GB") : "—"} hint={traffic ? `${traffic.totals.pageviews.toLocaleString("en-GB")} page views` : undefined} />
        <Card label="Bookings" value={stats ? String(stats.bookings) : "—"} hint="online and added by hand" />
        <Card label="Visitors who booked" value={conversion != null ? `${conversion.toFixed(1)}%` : "—"} />
        <Card label="Taken online" value={stats ? gbp(stats.takenOnline) : "—"} hint="deposits, balances, memberships" />
      </div>

      {!analyticsConfigured() && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Website traffic needs a Vercel access token in the rt_spaces_analytics setting. Bookings below work without it.
        </p>
      )}
      {trafficError && <p className="text-sm text-rose-700">{trafficError}</p>}

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <div className="p-4 pb-2">
          <h2 className="text-sm font-semibold text-gray-900">Bookings by source</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Where each customer first came from, from the links&apos; utm_source tag or the site that sent them.
            Bookings made before tracking started show as &ldquo;not tracked yet&rdquo;.
          </p>
        </div>
        {stats && stats.bySource.length ? (
          <table className="w-full text-sm">
            <thead className="border-y border-gray-200 bg-gray-50">
              <tr>
                {["Source", "Bookings", "Booking value"].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.bySource.map((r) => (
                <tr key={r.source}>
                  <td className="px-4 py-2 text-gray-900">{r.source}</td>
                  <td className="px-4 py-2 text-gray-700 tabular-nums">{r.bookings}</td>
                  <td className="px-4 py-2 text-gray-700 tabular-nums">{gbp(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 pb-4 text-sm text-gray-400">{stats ? "No bookings in this period." : "Couldn't load bookings."}</p>
        )}
      </div>

      {traffic && (
        <>
          <DailyChart points={traffic.daily} />
          <div className="grid gap-4 md:grid-cols-2">
            <TopList title="Where visitors came from" rows={traffic.referrers.map((r) => ({ label: r.label, value: r.visitors }))} />
            <TopList title="Top pages" rows={traffic.pages.map((r) => ({ label: pageName(r.key), value: r.visitors }))} />
            <TopList title="Devices" rows={traffic.devices.map((r) => ({ label: deviceName(r.key), value: r.visitors }))} />
            <TopList title="Countries" rows={traffic.countries.map((r) => ({ label: countryName(r.key), value: r.visitors }))} />
          </div>
        </>
      )}
    </div>
  );
}

async function loadTraffic(since: Date, until: Date) {
  const [sum, points, referrers, pages, devices, countries] = await Promise.all([
    totals(since, until),
    daily(since, until),
    breakdown("referrerHostname", since, until, 12),
    breakdown("requestPath", since, until, 8),
    breakdown("deviceType", since, until, 4),
    breakdown("country", since, until, 6),
  ]);
  return {
    totals: sum,
    daily: points,
    // Same names as the booking sources: "instagram", "google", "direct".
    referrers: labelled(referrers, (host) => (host ? sourceFromReferrer(`https://${host}`) ?? host : "direct")).slice(0, 8),
    pages,
    devices,
    countries,
  };
}
