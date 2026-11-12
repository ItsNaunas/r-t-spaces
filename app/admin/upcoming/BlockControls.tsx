"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input = "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });

/** Close the studio for a few hours or a day, with no customer involved. */
export function BlockOutForm({ eventSlug, minHours, maxHours }: { eventSlug: string; minHours: number; maxHours: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(maxHours);
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [start, setStart] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

  async function findTimes() {
    setBusy(true);
    setError("");
    setSlots(null);
    setStart("");
    try {
      const res = await fetch(`/api/admin/slots?${new URLSearchParams({ packageId: eventSlug, date, hours: String(hours) })}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't load times");
      setSlots(json.slots.map((s: { start: string }) => s.start));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load times");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, hours, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't block that time");
      setDone(json.message);
      setOpen(false);
      setSlots(null);
      setStart("");
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't block that time");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => { setOpen(true); setDone(""); }} className="border border-gray-900 text-sm px-4 py-2 rounded-md hover:bg-gray-50">
          Block out time
        </button>
        {done && <p className="text-sm text-emerald-700">{done}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Block out time</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Close the studio for a private shoot, maintenance or a day off. Nobody can book that time on the website.
            For a whole day, choose {maxHours} hours and the first time.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-gray-900">Close</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass} htmlFor="bo-date">Date</label>
          <input id="bo-date" type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setSlots(null); }} className={input} />
        </div>
        <div>
          <label className={labelClass} htmlFor="bo-hours">Hours</label>
          <input id="bo-hours" type="number" min={minHours} max={maxHours} value={hours} onChange={(e) => { setHours(Number(e.target.value)); setSlots(null); }} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="bo-reason">Reason (only you see it)</label>
          <input id="bo-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={80} placeholder="e.g. Private shoot" className={input} />
        </div>
      </div>
      <button type="button" onClick={findTimes} disabled={!date || busy} className="border border-gray-900 text-sm px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-40">
        {busy && !slots ? "Checking…" : "Find free times"}
      </button>
      {slots && (
        <div>
          <p className={labelClass}>Start at</p>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-500">No free {hours}-hour stretch that day. Try fewer hours or another date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <button key={s} type="button" onClick={() => setStart(s)} className={`px-3 py-1.5 text-sm rounded-md border ${start === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 hover:border-gray-900"}`}>
                  {timeLabel(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-rose-700">{error}</p>}
      <button type="button" onClick={submit} disabled={!start || busy} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-40">
        {busy && start ? "Blocking…" : "Block this time"}
      </button>
    </div>
  );
}

export function ReopenButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function reopen() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/blocks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setConfirming(false);
    if (res.ok) router.refresh();
    else setError(json.error ?? "Couldn't reopen");
  }

  return (
    <span className="text-right">
      <button type="button" onClick={reopen} disabled={busy} className={`text-xs border rounded px-2 py-1 ${confirming ? "border-rose-300 text-rose-700 bg-rose-50" : "border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900"}`}>
        {confirming ? "Click again to reopen" : "Reopen"}
      </button>
      {error && <span className="block text-xs text-rose-700 mt-1">{error}</span>}
    </span>
  );
}
