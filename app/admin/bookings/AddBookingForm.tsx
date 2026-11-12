"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PackageOption = {
  id: string;
  title: string;
  hours: number;
  priceFromTime: boolean;
  minimumHours: number;
};

type Slot = { start: string; price: number };

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" });

const inputClass =
  "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

/**
 * Add a phone / WhatsApp / walk-in booking. It is created and confirmed in
 * Cal.com straight away, so the time disappears from the website.
 */
export function AddBookingForm({ packages }: { packages: PackageOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState(2);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [start, setStart] = useState("");
  const [total, setTotal] = useState("");
  const [paid, setPaid] = useState("0");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [emailCustomer, setEmailCustomer] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const pkg = packages.find((p) => p.id === packageId);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

  function resetSlots() {
    setSlots(null);
    setStart("");
  }

  async function findTimes() {
    if (!date || !pkg) return;
    setLoadingSlots(true);
    setError("");
    resetSlots();
    try {
      const qs = new URLSearchParams({ packageId, date, ...(pkg.priceFromTime ? { hours: String(hours) } : {}) });
      const res = await fetch(`/api/admin/slots?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't load times");
      setSlots(json.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load times");
    } finally {
      setLoadingSlots(false);
    }
  }

  function pick(slot: Slot) {
    setStart(slot.start);
    setTotal(slot.price.toFixed(2));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/manual-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          start,
          ...(pkg?.priceFromTime ? { hours } : {}),
          name,
          email,
          phone,
          notes,
          totalPrice: total,
          paidUpfront: paid || 0,
          emailCustomer,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't add the booking");
      setDone(
        `Booked ${name} for ${new Date(start).toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" })}.` +
          (json.warnings?.length ? ` ${json.warnings.join(" ")}` : "")
      );
      setOpen(false);
      resetSlots();
      setDate("");
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setPaid("0");
      setTotal("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add the booking");
    } finally {
      setSaving(false);
    }
  }

  const owed = Math.max(0, (Number(total) || 0) - (Number(paid) || 0));

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setDone("");
          }}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-700"
        >
          + Add booking
        </button>
        {done && <p className="text-sm text-emerald-700">{done}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-5 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Add a booking</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            For phone, WhatsApp and walk-in bookings. It&apos;s confirmed in Cal.com straight away, so the time
            disappears from the website.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-gray-900">
          Close
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className={labelClass} htmlFor="ab-package">Package</label>
          <select
            id="ab-package"
            value={packageId}
            onChange={(e) => {
              setPackageId(e.target.value);
              resetSlots();
            }}
            className={inputClass}
          >
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ab-date">Date</label>
          <input
            id="ab-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              resetSlots();
            }}
            className={inputClass}
            required
          />
        </div>
        {pkg?.priceFromTime && (
          <div>
            <label className={labelClass} htmlFor="ab-hours">Hours</label>
            <input
              id="ab-hours"
              type="number"
              min={pkg.minimumHours}
              max={12}
              value={hours}
              onChange={(e) => {
                setHours(Number(e.target.value));
                resetSlots();
              }}
              className={inputClass}
            />
          </div>
        )}
        <div className="flex items-end">
          <button
            type="button"
            onClick={findTimes}
            disabled={!date || loadingSlots}
            className="border border-gray-900 text-sm px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-40"
          >
            {loadingSlots ? "Checking…" : "Find free times"}
          </button>
        </div>
      </div>

      {slots && (
        <div>
          <p className={labelClass}>Free times</p>
          {slots.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing free that day for this package. Try another date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  key={s.start}
                  type="button"
                  onClick={() => pick(s)}
                  className={`px-3 py-1.5 text-sm rounded-md border ${
                    start === s.start ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 hover:border-gray-900"
                  }`}
                >
                  {timeLabel(s.start)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {start && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="ab-total">Total price (£)</label>
              <input id="ab-total" type="number" min={0} step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="ab-paid">Already paid (£)</label>
              <input id="ab-paid" type="number" min={0} step="0.01" value={paid} onChange={(e) => setPaid(e.target.value)} className={inputClass} />
              <p className="text-[11px] text-gray-400 mt-1">Cash or card taken in person.</p>
            </div>
            <div>
              <p className={labelClass}>Still owed</p>
              <p className="py-2 text-sm font-semibold text-gray-900">£{owed.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="ab-name">Customer name</label>
              <input id="ab-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required maxLength={100} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ab-email">Email</label>
              <input id="ab-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} maxLength={200} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ab-phone">Phone</label>
              <input id="ab-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} maxLength={40} />
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass} htmlFor="ab-notes">Notes (optional)</label>
              <textarea id="ab-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} className={inputClass} />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={emailCustomer} onChange={(e) => setEmailCustomer(e.target.checked)} className="mt-0.5" />
            <span>
              Email the customer
              <span className="block text-xs text-gray-400">
                A confirmation now and, if money is owed, the payment link 2 days before. Untick if you&apos;ve sorted
                everything with them directly. Cal.com may still send its own confirmation to the email above.
              </span>
            </span>
          </label>
        </>
      )}

      {error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!start || saving}
          className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-40"
        >
          {saving ? "Booking…" : "Add booking"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-900">
          Cancel
        </button>
      </div>
    </form>
  );
}
