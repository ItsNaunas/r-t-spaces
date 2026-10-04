"use client";

import { useMemo, useState } from "react";
import {
  bundleWasPrice,
  checkPromotion,
  isPromotionLive,
  londonDateKey,
  londonTimeToIso,
  type Promotion,
} from "@/lib/promotion";

/** ISO instant -> YYYY-MM-DD in UK time (the studio's), not the laptop's. */
function toDateInput(iso: string | null): string {
  return iso ? londonDateKey(iso) : "";
}

const inputCls =
  "border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-900";

export function PromotionClient({ initial }: { initial: Promotion }) {
  const [p, setP] = useState<Promotion>(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const check = useMemo(() => checkPromotion(p), [p]);
  const liveNow = isPromotionLive(p);
  const set = (patch: Partial<Promotion>) => {
    setP((prev) => ({ ...prev, ...patch }));
    setNotice(null);
  };

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/promotion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to save");
      setP(data.promotion);
      setNotice({ ok: true, text: "Saved. The website is updated." });
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const money = (label: string, value: number, onChange: (n: number) => void) => (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="flex items-center gap-1">
        <span className="text-gray-400">£</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`${inputCls} w-24`}
        />
      </span>
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Status + switch */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">Offer status</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {liveNow
                ? "Live on the website now."
                : p.enabled
                  ? "Switched on, but outside its dates, so not showing."
                  : "Switched off. Normal prices are showing."}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              liveNow ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
            }`}
          >
            {liveNow ? "Live" : "Not live"}
          </span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-900">
          <input type="checkbox" checked={p.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
          Offer switched on
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm text-gray-600 space-y-1">
            <span className="block">Starts (optional)</span>
            <input
              type="date"
              value={toDateInput(p.startsAt)}
              onChange={(e) =>
                set({ startsAt: e.target.value ? londonTimeToIso(e.target.value, "00:00:00") : null })
              }
              className={`${inputCls} w-full`}
            />
          </label>
          <label className="text-sm text-gray-600 space-y-1">
            <span className="block">Ends (last day of the offer)</span>
            <input
              type="date"
              value={toDateInput(p.endsAt)}
              onChange={(e) =>
                set({ endsAt: e.target.value ? londonTimeToIso(e.target.value, "23:59:59") : null })
              }
              className={`${inputCls} w-full`}
            />
          </label>
        </div>
        <p className="text-xs text-gray-400">
          Dates are UK time: the offer starts at midnight and ends at 23:59 on the last day.
          Customers who booked during the offer keep their price. New bookings at offer prices stop
          at the end of the last day.
        </p>
      </section>

      {/* Pop-up */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <p className="font-medium text-gray-900">Pop-up</p>
        <label className="flex items-center gap-2 text-sm text-gray-900">
          <input
            type="checkbox"
            checked={p.popupEnabled}
            onChange={(e) => set({ popupEnabled: e.target.checked })}
          />
          Show the pop-up when someone opens the website (once per visit)
        </label>
        <label className="block text-sm text-gray-600 space-y-1">
          <span className="block">Headline</span>
          <input
            type="text"
            maxLength={120}
            value={p.headline}
            onChange={(e) => set({ headline: e.target.value })}
            className={`${inputCls} w-full`}
          />
        </label>
      </section>

      {/* Session prices */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <p className="font-medium text-gray-900">Offer prices</p>
        <p className="text-xs text-gray-400">
          Half day is 4 hours, full day is 8 hours. Weekend means Saturday and Sunday. While the offer
          is live these replace the normal Half Day and Full Day.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {money("Weekday half day", p.halfDay.weekday, (n) => set({ halfDay: { ...p.halfDay, weekday: n } }))}
          {money("Weekend half day", p.halfDay.weekend, (n) => set({ halfDay: { ...p.halfDay, weekend: n } }))}
          {money("Weekday full day", p.fullDay.weekday, (n) => set({ fullDay: { ...p.fullDay, weekday: n } }))}
          {money("Weekend full day", p.fullDay.weekend, (n) => set({ fullDay: { ...p.fullDay, weekend: n } }))}
        </div>
      </section>

      {/* Block bookings */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div>
          <p className="font-medium text-gray-900">Block bookings</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Full days (8 hours each). Customers pick all their dates when they pay. The crossed-out
            price is worked out for you: days × the day rate below.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {money("Crossed-out price per day", p.bundleWasDayRate, (n) => set({ bundleWasDayRate: n }))}
          {money("Each extra backdrop", p.extraBackdropPrice, (n) => set({ extraBackdropPrice: n }))}
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-600">Weekends allowed from</span>
            <span className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                step={1}
                value={p.weekendMinDays}
                onChange={(e) => set({ weekendMinDays: parseInt(e.target.value, 10) })}
                className={`${inputCls} w-16`}
              />
              <span className="text-gray-400">days</span>
            </span>
          </label>
        </div>

        <div className="border border-gray-100 rounded divide-y divide-gray-100">
          <div className="grid grid-cols-[4rem_1fr_1fr_auto] gap-3 px-3 py-2 text-xs text-gray-400">
            <span>Days</span>
            <span>Customer pays</span>
            <span>Shows as</span>
            <span />
          </div>
          {p.bundles.map((b, i) => {
            const was = bundleWasPrice(p, b.days || 0);
            const update = (patch: Partial<typeof b>) =>
              set({ bundles: p.bundles.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <div
                key={i}
                className={`grid grid-cols-[4rem_1fr_1fr_auto] items-center gap-3 px-3 py-2 ${
                  b.enabled ? "" : "opacity-50"
                }`}
              >
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={Number.isFinite(b.days) ? b.days : ""}
                  onChange={(e) => update({ days: parseInt(e.target.value, 10) })}
                  className={`${inputCls} w-14`}
                />
                <span className="flex items-center gap-1 text-sm">
                  <span className="text-gray-400">£</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number.isFinite(b.price) ? b.price : ""}
                    onChange={(e) => update({ price: parseFloat(e.target.value) })}
                    className={`${inputCls} w-24`}
                  />
                </span>
                <span className="text-sm">
                  <span className="text-gray-400 line-through mr-2">£{was.toFixed(2)}</span>
                  <span className="font-semibold text-red-600">
                    £{Number.isFinite(b.price) ? b.price.toFixed(2) : "–"}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => update({ enabled: !b.enabled })}
                    className="text-gray-500 underline hover:text-gray-900"
                  >
                    {b.enabled ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ bundles: p.bundles.filter((_, j) => j !== i) })}
                    className="text-gray-400 underline hover:text-red-600"
                  >
                    Remove
                  </button>
                </span>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = Math.max(1, ...p.bundles.map((b) => b.days || 0)) + 1;
            set({ bundles: [...p.bundles, { days: Math.min(30, next), price: 0, enabled: true }] });
          }}
          className="text-xs text-gray-600 underline hover:text-gray-900"
        >
          + Add a block
        </button>
      </section>

      {/* Checks */}
      {(check.errors.length > 0 || check.warnings.length > 0) && (
        <section className="space-y-2">
          {check.errors.map((e) => (
            <p key={e} className="text-sm rounded border border-red-200 bg-red-50 text-red-800 px-3 py-2">
              {e}
            </p>
          ))}
          {check.warnings.map((w) => (
            <p key={w} className="text-sm rounded border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2">
              ⚠ {w}
            </p>
          ))}
        </section>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving || check.errors.length > 0}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {notice && (
          <span className={`text-sm ${notice.ok ? "text-green-700" : "text-red-700"}`}>{notice.text}</span>
        )}
      </div>
    </div>
  );
}
