"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type VoucherRow = {
  code: string;
  amount: number;
  left: number;
  createdAt: string;
  expiresAt: string;
  source: "purchase" | "manual";
  from: string;
  to: string;
  status: "active" | "used" | "expired" | "off";
};

const STATUS: Record<VoucherRow["status"], string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  used: "bg-gray-50 text-gray-500 border-gray-200",
  expired: "bg-amber-50 text-amber-700 border-amber-200",
  off: "bg-rose-50 text-rose-700 border-rose-200",
};
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const input = "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gray-900";

function SwitchOff({ code }: { code: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    if (!confirming) return setConfirming(true);
    const res = await fetch(`/api/admin/vouchers?code=${encodeURIComponent(code)}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    setConfirming(false);
    if (res.ok) router.refresh();
    else setError(json.error ?? "Couldn't switch it off");
  }
  return (
    <>
      <button type="button" onClick={go} className={`text-xs border rounded px-2 py-1 ${confirming ? "border-rose-300 text-rose-700 bg-rose-50" : "border-gray-200 text-gray-500 hover:text-gray-900"}`}>
        {confirming ? "Click again to switch off" : "Switch off"}
      </button>
      {error && <p className="text-xs text-rose-700">{error}</p>}
    </>
  );
}

export function VouchersClient({ vouchers }: { vouchers: VoucherRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, recipientName, recipientEmail, note }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    setMessage(res.ok ? { ok: true, text: json.message } : { ok: false, text: json.error ?? "Couldn't create it" });
    if (res.ok) {
      setOpen(false);
      setAmount("");
      setRecipientName("");
      setRecipientEmail("");
      setNote("");
      router.refresh();
    }
  }

  const q = search.trim().toUpperCase();
  const shown = vouchers.filter((v) => !q || v.code.includes(q) || v.from.toUpperCase().includes(q) || v.to.toUpperCase().includes(q));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code or name…" className="border border-gray-200 rounded-md px-3 py-2 text-sm w-64 max-w-full focus:outline-none focus:border-gray-900" />
        <button type="button" onClick={() => setOpen((o) => !o)} className="border border-gray-900 text-sm px-4 py-2 rounded-md hover:bg-gray-50">
          + Give a voucher
        </button>
        {message && <p className={`text-sm ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>}
      </div>

      {open && (
        <form onSubmit={issue} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 max-w-2xl">
          <div>
            <h2 className="font-semibold text-gray-900">Give a complimentary voucher</h2>
            <p className="text-xs text-gray-500 mt-0.5">For prizes, apologies or partners. No payment is taken. Valid 12 months.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="cv-amount">Amount (£)</label>
              <input id="cv-amount" type="number" min={1} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className={input} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="cv-name">For (optional)</label>
              <input id="cv-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} maxLength={100} className={input} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="cv-email">Email it to (optional)</label>
              <input id="cv-email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} maxLength={200} className={input} />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="cv-note">Note (only you see it)</label>
              <input id="cv-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className={input} />
            </div>
          </div>
          <button type="submit" disabled={busy} className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-40">
            {busy ? "Creating…" : "Create voucher"}
          </button>
        </form>
      )}

      {shown.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-400">
          {vouchers.length ? "No results for that search." : "No vouchers yet."}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Code", "Value", "Left", "From", "For", "Bought", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shown.map((v) => (
                <tr key={v.code}>
                  <td className="px-4 py-3 font-mono text-gray-900 whitespace-nowrap">{v.code}</td>
                  <td className="px-4 py-3 text-gray-700 tabular-nums">£{v.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">£{v.left.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700">{v.from}</td>
                  <td className="px-4 py-3 text-gray-500">{v.to || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(v.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{date(v.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs border capitalize ${STATUS[v.status]}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">{v.status === "active" && <SwitchOff code={v.code} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
