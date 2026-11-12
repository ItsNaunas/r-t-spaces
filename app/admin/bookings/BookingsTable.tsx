"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingRow } from "@/lib/admin/bookingRows";

type Booking = BookingRow;

const BALANCE_BADGE: Record<Booking["balanceState"], { label: string; className: string } | null> = {
  none: null,
  owed: { label: "Owed", className: "bg-amber-50 text-amber-700 border-amber-200" },
  link_sent: { label: "Link sent", className: "bg-sky-50 text-sky-700 border-sky-200" },
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  refunded: { label: "Refunded", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

function BalanceBadge({ b }: { b: Booking }) {
  const badge = BALANCE_BADGE[b.balanceState];
  if (!badge) return null;
  const when = b.balanceAt
    ? ` ${new Date(b.balanceAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`
    : "";
  return (
    <span className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-xs border whitespace-nowrap ${badge.className}`}>
      {badge.label}
      {b.balanceState === "paid" && b.balancePaidInPerson ? " (in person)" : ""}
      {when}
    </span>
  );
}

type Action =
  | { action: "send_link"; email?: string }
  | { action: "mark_paid" }
  | { action: "cancel" }
  | { action: "refund"; scope: "balance" | "deposit" | "all" };

/** The buttons for one booking. Anything that moves money or frees a slot asks twice. */
function RowActions({ b }: { b: Booking }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [linkEmail, setLinkEmail] = useState("");

  const owes = ["owed", "link_sent", "refunded"].includes(b.balanceState);
  const hasEmail = b.customerEmail && b.customerEmail !== "—";
  const canRefundBalance = b.kind === "online" && b.balanceState === "paid" && !b.balancePaidInPerson;

  async function run(key: string, body: Action) {
    if (confirming !== key) {
      setConfirming(key);
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/admin/bookings/${encodeURIComponent(b.sessionId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      setNote(res.ok ? { ok: true, text: json.message ?? "Done." } : { ok: false, text: json.error ?? "That didn't work." });
      if (res.ok) router.refresh();
    } catch {
      setNote({ ok: false, text: "Couldn't reach the server. Try again." });
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  const button = (key: string, label: string, confirmLabel: string, body: Action, danger = false) => (
    <button
      key={key}
      type="button"
      disabled={busy}
      onClick={() => run(key, body)}
      className={`block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-gray-50 disabled:opacity-50 ${
        confirming === key
          ? danger
            ? "bg-rose-50 text-rose-700 font-medium"
            : "bg-gray-100 font-medium"
          : danger
            ? "text-rose-700"
            : "text-gray-700"
      }`}
    >
      {confirming === key ? confirmLabel : label}
    </button>
  );

  if (b.cancelled) return <span className="text-xs text-gray-400">Cancelled</span>;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setConfirming(null);
        }}
        className="text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 hover:border-gray-900 hover:text-gray-900 whitespace-nowrap"
        aria-expanded={open}
      >
        Actions ▾
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-1.5 space-y-0.5">
          {owes && (
            <>
              {!hasEmail && (
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="Email to send the link to"
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-1"
                />
              )}
              {button(
                "link",
                b.balanceState === "link_sent" ? "Resend payment link" : "Send payment link now",
                "Click again to send",
                { action: "send_link", ...(linkEmail ? { email: linkEmail } : {}) }
              )}
              {button("paid", "Mark balance paid (in person)", "Click again: paid in full?", { action: "mark_paid" })}
            </>
          )}
          {canRefundBalance &&
            button("refund-balance", "Refund the balance", "Click again to refund the balance", { action: "refund", scope: "balance" }, true)}
          {b.kind === "online" &&
            button(
              "refund-all",
              canRefundBalance ? "Refund everything and cancel" : "Refund deposit and cancel",
              "Click again to refund and cancel",
              { action: "refund", scope: canRefundBalance ? "all" : "deposit" },
              true
            )}
          {button(
            "cancel",
            b.kind === "online" ? "Cancel without refund" : "Cancel booking",
            "Click again to cancel (frees the slot)",
            { action: "cancel" },
            true
          )}
          {note && <p className={`px-3 pt-1.5 text-xs ${note.ok ? "text-emerald-700" : "text-rose-700"}`}>{note.text}</p>}
        </div>
      )}
      {!open && note && <p className={`mt-1 text-xs ${note.ok ? "text-emerald-700" : "text-rose-700"}`}>{note.text}</p>}
    </div>
  );
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);

  const q = search.toLowerCase();
  const filtered = bookings.filter(
    (b) =>
      (showCancelled || !b.cancelled) &&
      (!q ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerEmail.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.bookingDate.toLowerCase().includes(q) ||
        b.packageTitle.toLowerCase().includes(q) ||
        b.source.includes(q) ||
        b.campaign.includes(q))
  );
  const cancelledCount = bookings.filter((b) => b.cancelled).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, date, package or source…"
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-80 max-w-full focus:outline-none focus:border-gray-900"
        />
        <span className="text-sm text-gray-400">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
        {cancelledCount > 0 && (
          <label className="text-sm text-gray-500 flex items-center gap-1.5">
            <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
            Show cancelled ({cancelledCount})
          </label>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">
          {bookings.length === 0 ? "No paid bookings found." : "No results for that search."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Customer", "Date & Time", "Package", "Total", "Paid", "Balance", "Discount", "Source", "Booked", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.sessionId} className={b.cancelled ? "opacity-50" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {b.customerName}
                      {b.kind === "manual" && (
                        <span className="ml-1.5 align-middle inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-violet-50 text-violet-700 border border-violet-200">
                          Manual
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{b.customerEmail}</p>
                    {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{b.bookingDate}</p>
                    <p className="text-xs text-gray-400">{b.bookingHours}</p>
                    {b.cancelled && <p className="text-xs text-rose-600 mt-0.5">Cancelled</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{b.packageTitle}</p>
                    {b.addonsSummary && <p className="text-xs text-gray-400 mt-0.5">{b.addonsSummary}</p>}
                    {b.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-56 truncate" title={b.notes}>
                        {b.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{b.totalPrice}</td>
                  <td className="px-4 py-3 text-gray-700">{b.depositPaid}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-500">{b.balanceDue}</p>
                    <BalanceBadge b={b} />
                  </td>
                  <td className="px-4 py-3">
                    {b.discountCode ? (
                      <div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.discountCode}
                        </span>
                        {b.discountAmount && <p className="text-xs text-gray-400 mt-0.5">-{b.discountAmount}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.source ? (
                      <div>
                        <p className="text-gray-700">{b.source}</p>
                        {b.campaign && <p className="text-xs text-gray-400">{b.campaign}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(b.paidAt * 1000).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                    {b.stripeUrl && (
                      <a
                        href={b.stripeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-gray-400 underline hover:text-gray-900"
                      >
                        Stripe ↗
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions b={b} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
