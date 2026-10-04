"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { calculateDeposit } from "@/lib/pricing";
import { addDaysToKey, formatPromoEnd, isWeekendDateKey, type PublicPromotion } from "@/lib/promotion";

type LivePromotion = Extract<PublicPromotion, { live: true }>;
type Step = "size" | "dates" | "details";

const WINDOW_DAYS = 60;
const MAX_EXTRA_BACKDROPS = 5;

const dateLabel = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});
const monthLabel = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" });
const timeLabel = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "numeric",
  minute: "2-digit",
});
const keyDate = (key: string) => new Date(`${key}T12:00:00Z`);
const gbp = (n: number) => `£${n.toFixed(2)}`;

function todayKeyLondon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Block bookings (special offer): choose a block size, pick that many full
 * days from live Cal.com availability, then pay one deposit for all of them.
 * Prices shown here are for display; /api/checkout/block recomputes them.
 */
export function BlockBookingFlow({
  promo,
  onBack,
}: {
  promo: LivePromotion;
  onBack: () => void;
}) {
  const [step, setStep] = useState<Step>("size");
  const [days, setDays] = useState<number | null>(null);
  const bundle = promo.bundles.find((b) => b.days === days) ?? null;

  // date key -> available start ISO strings
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [loadedUntil, setLoadedUntil] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  // date key -> chosen start ISO
  const [picked, setPicked] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [extraBackdrops, setExtraBackdrops] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const weekendsAllowed = (bundle?.days ?? 0) >= promo.weekendMinDays;
  const pickedKeys = Object.keys(picked).sort();
  const remaining = (bundle?.days ?? 0) - pickedKeys.length;

  const loadSlots = useCallback(async (from: string) => {
    const to = addDaysToKey(from, WINDOW_DAYS - 1);
    setLoadingSlots(true);
    setSlotError("");
    try {
      const res = await fetch(`/api/promotion/slots?from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not load dates");
      setSlots((prev) => ({ ...prev, ...data.dates }));
      setLoadedUntil(to);
    } catch (e) {
      setSlotError(e instanceof Error ? e.message : "Could not load dates");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (step === "dates" && !loadedUntil && !loadingSlots) {
      loadSlots(addDaysToKey(todayKeyLondon(), 1));
    }
  }, [step, loadedUntil, loadingSlots, loadSlots]);

  const dateKeys = useMemo(() => Object.keys(slots).sort(), [slots]);
  const byMonth = useMemo(() => {
    const groups: { month: string; keys: string[] }[] = [];
    for (const key of dateKeys) {
      const month = monthLabel.format(keyDate(key));
      const last = groups[groups.length - 1];
      if (last?.month === month) last.keys.push(key);
      else groups.push({ month, keys: [key] });
    }
    return groups;
  }, [dateKeys]);

  const togglePick = (key: string) => {
    setError("");
    setPicked((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (!bundle || Object.keys(prev).length >= bundle.days) return prev;
      return { ...prev, [key]: slots[key][0] };
    });
  };

  const deposit = bundle ? Math.round(calculateDeposit(bundle.price) * 100) / 100 : 0;
  const backdropTotal = Math.round(extraBackdrops * promo.extraBackdropPrice * 100) / 100;

  const pay = async () => {
    if (!bundle) return;
    setSubmitting(true);
    setError("");
    track("booking_checkout_started", { package: `block-${bundle.days}` });
    try {
      const res = await fetch("/api/checkout/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Choices only. The server prices the block from the live offer.
        body: JSON.stringify({
          days: bundle.days,
          starts: pickedKeys.map((k) => picked[k]),
          name,
          email,
          notes,
          extraBackdrops,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data?.unavailable)) {
          // Someone else got there first: drop those days and refresh.
          const gone = new Set<string>(data.unavailable);
          setPicked((prev) => Object.fromEntries(Object.entries(prev).filter(([, v]) => !gone.has(v))));
          setSlots({});
          setLoadedUntil(null);
          setStep("dates");
        }
        throw new Error(data?.error ?? "Something went wrong");
      }
      if (!data.url) throw new Error("No checkout link received");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const steps: Step[] = ["size", "dates", "details"];
  const stepIndex = steps.indexOf(step);
  const canContinue =
    step === "size" ? Boolean(bundle) : step === "dates" ? remaining === 0 : false;
  const detailsValid = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && agreed;

  return (
    <div className="flex h-full flex-col bg-[var(--base)]">
      <div className="shrink-0 border-b border-[var(--lavender)] bg-white px-5 py-3">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-[var(--primary)]" : "bg-[var(--lavender)]/50"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)]">
          Block booking · Step {stepIndex + 1} of {steps.length}
          {step === "size" && " · How many days?"}
          {step === "dates" && " · Pick your days"}
          {step === "details" && " · Review & pay"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === "size" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
                Special offer{promo.endsAt ? ` · ends ${formatPromoEnd(promo.endsAt)}` : ""}
              </p>
              <h3 className="mt-1 font-heading text-2xl text-[var(--primary)]">Block bookings</h3>
              <p className="mt-1 text-sm text-[var(--muted-plum)]">
                Full days (8 hours each). Pick any days you like; they don&apos;t have to be in a row.
                Weekends are included in blocks of {promo.weekendMinDays} days or more.
              </p>
            </div>
            <div className="grid gap-3">
              {promo.bundles.map((b) => {
                const selected = days === b.days;
                return (
                  <button
                    key={b.days}
                    type="button"
                    onClick={() => {
                      track("booking_option", { package: `block-${b.days}` });
                      if (days !== b.days) setPicked({});
                      setDays(b.days);
                    }}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                      selected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]"
                        : "border-[var(--lavender)] bg-white hover:border-[var(--primary)]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading font-semibold text-[var(--primary)]">{b.days} days</p>
                        <p className="text-sm text-[var(--muted-plum)]">
                          {b.days < promo.weekendMinDays ? "Weekdays only" : "Weekdays & weekends"} ·{" "}
                          {gbp(b.price / b.days)} per day
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm text-[var(--muted-plum)] line-through">{gbp(b.wasPrice)}</p>
                        <p className="font-heading text-lg font-semibold text-red-600">{gbp(b.price)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--muted-plum)]">
              Includes 1 backdrop. Extra backdrops {gbp(promo.extraBackdropPrice)} each.
            </p>
          </div>
        )}

        {step === "dates" && bundle && (
          <div className="space-y-4">
            <div>
              <h3 className="font-heading text-2xl text-[var(--primary)]">Pick {bundle.days} days</h3>
              <p className="mt-1 text-sm text-[var(--muted-plum)]">
                {remaining > 0
                  ? `${pickedKeys.length} of ${bundle.days} chosen. Pick ${remaining} more.`
                  : `All ${bundle.days} days chosen.`}
                {!weekendsAllowed && " Weekends need a block of " + promo.weekendMinDays + "+ days."}
              </p>
            </div>

            {slotError && (
              <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-800">{slotError}</div>
            )}
            {loadingSlots && dateKeys.length === 0 && (
              <p className="text-sm text-[var(--muted-plum)]">Loading available days…</p>
            )}
            {!loadingSlots && !slotError && dateKeys.length === 0 && (
              <p className="text-sm text-[var(--muted-plum)]">No full days available in this period.</p>
            )}

            {byMonth.map((group) => (
              <div key={group.month} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-plum)]">
                  {group.month}
                </p>
                <div className="grid gap-2">
                  {group.keys.map((key) => {
                    const weekend = isWeekendDateKey(key);
                    const blocked = weekend && !weekendsAllowed;
                    const isPicked = Boolean(picked[key]);
                    const full = !isPicked && remaining <= 0;
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-2 ${
                          isPicked
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-[var(--lavender)] bg-white"
                        } ${blocked ? "opacity-40" : ""}`}
                      >
                        <button
                          type="button"
                          disabled={blocked || full}
                          onClick={() => togglePick(key)}
                          className="flex flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                          aria-pressed={isPicked}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 text-xs ${
                              isPicked
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-[var(--lavender)]"
                            }`}
                          >
                            {isPicked ? "✓" : ""}
                          </span>
                          <span className="font-medium text-[var(--primary)]">{dateLabel.format(keyDate(key))}</span>
                          {weekend && <span className="text-xs text-[var(--muted-plum)]">Weekend</span>}
                        </button>
                        {isPicked && slots[key].length > 1 && (
                          <select
                            value={picked[key]}
                            onChange={(e) => setPicked((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="rounded border border-[var(--lavender)] bg-white px-2 py-1 text-sm text-[var(--primary)]"
                            aria-label={`Start time on ${dateLabel.format(keyDate(key))}`}
                          >
                            {slots[key].map((s) => (
                              <option key={s} value={s}>
                                Start {timeLabel.format(new Date(s))}
                              </option>
                            ))}
                          </select>
                        )}
                        {isPicked && slots[key].length === 1 && (
                          <span className="text-sm text-[var(--muted-plum)]">
                            From {timeLabel.format(new Date(picked[key]))}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {loadedUntil && (
              <button
                type="button"
                disabled={loadingSlots}
                onClick={() => loadSlots(addDaysToKey(loadedUntil, 1))}
                className="text-sm text-[var(--muted-plum)] underline underline-offset-2 hover:text-[var(--primary)] disabled:opacity-50"
              >
                {loadingSlots ? "Loading…" : "Show later dates"}
              </button>
            )}
          </div>
        )}

        {step === "details" && bundle && (
          <div className="space-y-5">
            <h3 className="font-heading text-2xl text-[var(--primary)]">Review &amp; pay your deposit</h3>

            <div className="space-y-2 border border-[var(--lavender)] bg-white p-4 text-sm">
              <p className="font-semibold text-[var(--primary)]">{bundle.days}-day block booking</p>
              <ul className="space-y-0.5 text-[var(--muted-plum)]">
                {pickedKeys.map((k) => (
                  <li key={k}>
                    {dateLabel.format(keyDate(k))}, from {timeLabel.format(new Date(picked[k]))} (8 hours)
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="rounded-xl border border-[var(--lavender)] bg-white px-3 py-2 text-sm text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="rounded-xl border border-[var(--lavender)] bg-white px-3 py-2 text-sm text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything we should know? (optional)"
                rows={3}
                maxLength={500}
                className="rounded-xl border border-[var(--lavender)] bg-white px-3 py-2 text-sm text-[var(--primary)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 border border-[var(--lavender)] bg-white p-4">
              <div>
                <p className="text-sm font-medium text-[var(--primary)]">Extra backdrops</p>
                <p className="text-xs text-[var(--muted-plum)]">
                  1 included. {gbp(promo.extraBackdropPrice)} each extra, paid on the day.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExtraBackdrops((n) => Math.max(0, n - 1))}
                  className="h-8 w-8 border border-[var(--lavender)] font-medium text-[var(--primary)]"
                  aria-label="One fewer backdrop"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-[var(--primary)]">{extraBackdrops}</span>
                <button
                  type="button"
                  onClick={() => setExtraBackdrops((n) => Math.min(MAX_EXTRA_BACKDROPS, n + 1))}
                  className="h-8 w-8 border border-[var(--lavender)] font-medium text-[var(--primary)]"
                  aria-label="One more backdrop"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2 border border-[var(--lavender)] bg-white p-4 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-[var(--muted-plum)]">{bundle.days} days</span>
                <span>
                  <span className="mr-2 text-[var(--muted-plum)] line-through">{gbp(bundle.wasPrice)}</span>
                  <span className="font-heading text-lg font-semibold text-red-600">{gbp(bundle.price)}</span>
                </span>
              </div>
              {backdropTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--muted-plum)]">Extra backdrops (on the day)</span>
                  <span className="font-semibold text-[var(--primary)]">{gbp(backdropTotal)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--lavender)] pt-2">
                <span className="text-[var(--muted-plum)]">Pay now (deposit)</span>
                <span className="font-semibold text-[var(--primary)]">{gbp(deposit)}</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--muted-plum)]">
                <span>Balance due before your first session begins</span>
                <span>{gbp(bundle.price - deposit + backdropTotal)}</span>
              </div>
            </div>

            <p className="text-xs text-[var(--muted-plum)]">
              We hold your days for 30 minutes while you pay. Discount codes can&apos;t be used with this offer.
            </p>

            <label className="flex items-start gap-3 text-sm text-[var(--primary)]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="underline underline-offset-2">
                  terms &amp; conditions
                </Link>
                , including the block booking terms.
              </span>
            </label>
          </div>
        )}

        {error && <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      </div>

      <div className="shrink-0 border-t border-[var(--lavender)] bg-white px-5 py-4">
        {bundle && (
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-sm text-[var(--muted-plum)]">{bundle.days}-day block</span>
            <span>
              <span className="mr-2 text-sm text-[var(--muted-plum)] line-through">{gbp(bundle.wasPrice)}</span>
              <span className="font-heading text-xl font-semibold text-red-600">{gbp(bundle.price)}</span>
            </span>
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => (stepIndex === 0 ? onBack() : setStep(steps[stepIndex - 1]))}
            className="btn-secondary flex-1"
            disabled={submitting}
          >
            Back
          </button>
          {step !== "details" ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(steps[stepIndex + 1]);
              }}
              disabled={!canContinue}
              className="btn-primary flex-[2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={pay}
              disabled={submitting || !detailsValid || remaining !== 0}
              className="btn-primary flex-[2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Processing…" : `Pay ${gbp(deposit)} deposit`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
