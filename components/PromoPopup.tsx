"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { useBooking } from "@/components/booking/BookingProvider";
import { promoFromPrice, type PublicPromotion } from "@/lib/promotion";

const SEEN_KEY = "rt-promo-popup-seen";

type LivePromotion = Extract<PublicPromotion, { live: true }>;

/**
 * The special offer pop-up: the first thing a visitor sees while the offer is
 * live, once per browser session. Prices come from /api/promotion, the same
 * source checkout charges from, so the pop-up can never advertise a price the
 * booking form won't honour.
 */
export function PromoPopup() {
  const { openBooking } = useBooking();
  const [promo, setPromo] = useState<LivePromotion | null>(null);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Storage blocked: show it, it just may show again next page load.
    }
    if (seen) return;

    fetch("/api/promotion")
      .then((r) => r.json())
      .then((data: PublicPromotion) => {
        if (data.live && data.popupEnabled) {
          setPromo(data);
          setOpen(true);
          track("promo_popup_shown");
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  if (!open || !promo) return null;

  const tiers = [
    { label: "Weekday Half Day", hours: "4 hours", price: promo.halfDay.weekday },
    { label: "Weekday Full Day", hours: "8 hours", price: promo.fullDay.weekday },
    { label: "Weekend Half Day", hours: "4 hours", price: promo.halfDay.weekend },
    { label: "Weekend Full Day", hours: "8 hours", price: promo.fullDay.weekend },
  ];
  const fromBlock = promo.bundles[0];
  const ends = promo.endsAt
    ? new Date(promo.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-title"
        className="relative w-full max-w-md bg-[var(--base)] p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="Close offer"
          className="absolute right-3 top-3 h-10 w-10 text-2xl leading-none text-[var(--muted-plum)] hover:text-[var(--primary)]"
        >
          ×
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">🎉 Special offer</p>
        <h2 id="promo-title" className="mt-2 font-heading text-2xl text-[var(--primary)] sm:text-3xl">
          {promo.headline || `Studio hire from £${promoFromPrice(promo)}`}
        </h2>

        <ul className="mt-5 divide-y divide-[var(--lavender)] border-y border-[var(--lavender)]">
          {tiers.map((t) => (
            <li key={t.label} className="flex items-baseline justify-between gap-3 py-2.5">
              <span>
                <span className="font-medium text-[var(--primary)]">{t.label}</span>
                <span className="ml-2 text-sm text-[var(--muted-plum)]">{t.hours}</span>
              </span>
              <span className="font-heading text-lg font-semibold text-red-600">£{t.price}</span>
            </li>
          ))}
        </ul>

        {fromBlock && (
          <p className="mt-3 text-sm text-[var(--muted-plum)]">
            Block bookings from{" "}
            <span className="text-[var(--muted-plum)] line-through">£{fromBlock.wasPrice.toFixed(2)}</span>{" "}
            <span className="font-semibold text-red-600">£{fromBlock.price.toFixed(2)}</span> for{" "}
            {fromBlock.days} days.
          </p>
        )}
        {ends && <p className="mt-1 text-xs text-[var(--muted-plum)]">Offer ends {ends}.</p>}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              track("promo_popup_book");
              dismiss();
              openBooking({ offer: "hire" });
            }}
          >
            Book now
          </button>
          <button type="button" className="btn-secondary flex-1" onClick={dismiss}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
