export const dynamic = "force-dynamic";

import Link from "next/link";
import { listCalBookings, type CalBooking } from "@/lib/calcom";
import { loadBookingRows } from "@/lib/admin/loadBookings";
import type { BookingRow } from "@/lib/admin/bookingRows";
import { getMergedPackages } from "@/lib/admin/pricing-merged";

const DAYS_AHEAD = 14;

type Item = {
  uid: string;
  start: string;
  end: string;
  name: string;
  email: string;
  packageTitle: string;
  kind: "booked" | "hold";
  row: BookingRow | null;
};

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });

function dayHeading(key: string, today: string, tomorrow: string) {
  if (key === today) return "Today";
  if (key === tomorrow) return "Tomorrow";
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function Payment({ item }: { item: Item }) {
  if (item.kind === "hold") {
    return <span className="text-xs px-1.5 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200">Held, not paid yet</span>;
  }
  const r = item.row;
  if (!r) {
    return (
      <span className="text-xs px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200" title="Booked in Cal.com, with no payment or manual booking on record">
        Cal.com only: check payment
      </span>
    );
  }
  if (r.balanceState === "none" || r.balanceState === "paid") {
    return <span className="text-xs px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">Paid in full</span>;
  }
  const label = r.balanceState === "link_sent" ? "link sent" : r.balanceState === "refunded" ? "refunded, owed again" : "no link yet";
  return (
    <span className="text-xs px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
      {r.balanceDue} owed · {label}
    </span>
  );
}

export default async function UpcomingPage() {
  const now = new Date();
  const until = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);
  // Include sessions already under way today; ones that ended over an hour ago are dropped below.
  const startOfToday = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const [bookedOrNull, holds, rows, packages] = await Promise.all([
    listCalBookings("upcoming", startOfToday, until).catch((e) => {
      console.error("[ADMIN] upcoming: Cal.com list failed", e);
      return null;
    }),
    listCalBookings("unconfirmed", now, until).catch(() => [] as CalBooking[]),
    loadBookingRows(180),
    getMergedPackages(),
  ]);

  const error = bookedOrNull ? "" : "Couldn't load bookings from Cal.com. Refresh to try again.";
  const booked = bookedOrNull ?? [];

  const byUid = new Map<string, BookingRow>();
  for (const r of rows) for (const uid of r.calBookingUids) byUid.set(uid, r);
  const titles = new Map(packages.map((p) => [p.id, p.title]));

  const items: Item[] = [
    ...booked.map((b) => ({ b, kind: "booked" as const })),
    ...holds.map((b) => ({ b, kind: "hold" as const })),
  ]
    .map(({ b, kind }) => {
      const row = byUid.get(b.uid) ?? null;
      return {
        uid: b.uid,
        start: b.start,
        end: b.end,
        name: row?.customerName ?? b.attendees?.[0]?.name ?? "—",
        email: row?.customerEmail ?? b.attendees?.[0]?.email ?? "",
        packageTitle: row?.packageTitle ?? titles.get(b.eventType?.slug ?? "") ?? b.eventType?.slug ?? "Booking",
        kind,
        row,
      };
    })
    .filter((i) => !i.row?.cancelled && Date.parse(i.end) > now.getTime() - 60 * 60 * 1000)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  const today = dayKey(now.toISOString());
  const tomorrow = dayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());
  const groups = new Map<string, Item[]>();
  for (const i of items) {
    const k = dayKey(i.start);
    groups.set(k, [...(groups.get(k) ?? []), i]);
  }

  const bookedItems = items.filter((i) => i.kind === "booked");
  const owing = bookedItems.filter((i) => i.row && ["owed", "link_sent", "refunded"].includes(i.row.balanceState));
  const owedTotal = owing.reduce((sum, i) => sum + (Number(i.row!.balanceDue.replace(/[^0-9.]/g, "")) || 0), 0);
  const unknown = bookedItems.filter((i) => !i.row).length;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Upcoming</h1>
        <p className="text-sm text-gray-500 mt-1">The next {DAYS_AHEAD} days, from Cal.com, with what each customer has paid.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Sessions booked</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{bookedItems.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Balances still owed</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {owing.length} <span className="text-base font-normal text-gray-500">· £{owedTotal.toFixed(2)}</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500">Held, awaiting payment</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{items.length - bookedItems.length}</p>
        </div>
      </div>

      {unknown > 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          {unknown} booking{unknown > 1 ? "s were" : " was"} made straight in Cal.com, or before payments were recorded here, so
          the payment isn&apos;t known. Check {unknown > 1 ? "them" : "it"} in Stripe.
        </p>
      )}
      {error && <p className="text-sm text-rose-700">{error}</p>}

      {groups.size === 0 && !error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">
          Nothing booked in the next {DAYS_AHEAD} days.
        </div>
      ) : (
        [...groups.entries()].map(([key, dayItems]) => (
          <section key={key}>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{dayHeading(key, today, tomorrow)}</h2>
            <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {dayItems.map((i) => (
                <li key={i.uid} className={`px-4 py-3 flex flex-wrap items-start gap-x-4 gap-y-1 ${i.kind === "hold" ? "opacity-60" : ""}`}>
                  <p className="w-28 shrink-0 text-sm font-medium text-gray-900 tabular-nums">
                    {time(i.start)}–{time(i.end)}
                  </p>
                  <div className="flex-1 min-w-48">
                    <p className="text-sm text-gray-900">
                      {i.name}
                      {i.row?.kind === "manual" && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-violet-700">Manual</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {i.packageTitle}
                      {i.row?.phone ? ` · ${i.row.phone}` : ""}
                      {i.email && i.email !== "—" ? ` · ${i.email}` : ""}
                    </p>
                    {i.row?.addonsSummary && <p className="text-xs text-gray-400">Add-ons: {i.row.addonsSummary}</p>}
                    {i.row?.notes && <p className="text-xs text-gray-400">Notes: {i.row.notes}</p>}
                  </div>
                  <Payment item={i} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <p className="text-xs text-gray-400">
        To send a payment link, mark something paid or cancel, use <Link href="/admin/bookings" className="underline">Bookings</Link>.
      </p>
    </div>
  );
}
