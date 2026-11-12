"use client";

import { useState } from "react";

const field =
  "w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-[var(--primary)] focus:border-[var(--primary)] focus:outline-none";
const label = "mb-1.5 block text-sm font-medium text-[var(--primary)]";

export function VoucherForm({ amounts, min, max }: { amounts: number[]; min: number; max: number }) {
  const [amount, setAmount] = useState<number | "custom">(amounts[1] ?? amounts[0]);
  const [custom, setCustom] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [isGift, setIsGift] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const value = amount === "custom" ? Number(custom) : amount;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/vouchers/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          buyerName,
          buyerEmail,
          ...(isGift ? { recipientName, recipientEmail, message } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error ?? "Couldn't start the payment.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the payment.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
      <fieldset>
        <legend className={label}>Amount</legend>
        <div className="flex flex-wrap gap-3">
          {amounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={`rounded-lg border px-5 py-3 font-semibold ${
                amount === a ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--primary)]"
              }`}
            >
              £{a}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount("custom")}
            className={`rounded-lg border px-5 py-3 font-semibold ${
              amount === "custom" ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] text-[var(--primary)]"
            }`}
          >
            Other
          </button>
        </div>
        {amount === "custom" && (
          <div className="mt-3 max-w-48">
            <label className="sr-only" htmlFor="v-custom">Amount in pounds</label>
            <input
              id="v-custom"
              type="number"
              min={min}
              max={max}
              step={1}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={`£${min}–£${max}`}
              className={field}
              required
            />
          </div>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="v-name">Your name</label>
          <input id="v-name" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={field} required maxLength={100} />
        </div>
        <div>
          <label className={label} htmlFor="v-email">Your email</label>
          <input id="v-email" type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className={field} required maxLength={200} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[var(--primary)]">
        <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
        It&apos;s a gift: email it to them for me
      </label>

      {isGift && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="v-rname">Their name</label>
            <input id="v-rname" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={field} maxLength={100} />
          </div>
          <div>
            <label className={label} htmlFor="v-remail">Their email</label>
            <input id="v-remail" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={field} maxLength={200} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="v-msg">Message (optional)</label>
            <textarea id="v-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={300} className={field} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy || !value || value < min || value > max}
        className="w-full rounded-lg bg-[var(--primary)] px-6 py-4 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Opening secure payment…" : `Buy a £${value || "…"} voucher`}
      </button>
      <p className="text-center text-xs text-[var(--muted-plum)]">
        Paid securely with Stripe. Valid for 12 months. Not exchangeable for cash.
      </p>
    </form>
  );
}
