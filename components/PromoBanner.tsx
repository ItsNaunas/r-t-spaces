"use client";

import { track } from "@vercel/analytics";
import { useBooking } from "@/components/booking/BookingProvider";
import { usePromotion } from "@/components/usePromotion";
import { formatPromoEnd, promoFromPrice } from "@/lib/promotion";

/**
 * Announcement bar above the header for as long as the special offer is live,
 * so the offer is still visible after the pop-up has been closed.
 */
export function PromoBanner() {
  const promo = usePromotion();
  const { openBooking } = useBooking();
  if (!promo) return null;

  const ends = formatPromoEnd(promo.endsAt);
  const fromBlock = promo.bundles[0];

  return (
    <div className="w-full bg-red-600 text-white">
      <button
        type="button"
        onClick={() => {
          track("promo_banner_book");
          openBooking({ offer: "hire" });
        }}
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-4 py-2 text-center text-xs sm:text-sm"
      >
        <span className="font-semibold uppercase tracking-[0.2em]">Special offer</span>
        <span>
          Studio hire from £{promoFromPrice(promo)}
          {fromBlock && (
            <span className="hidden sm:inline"> · block bookings from £{fromBlock.price.toFixed(2)}</span>
          )}
        </span>
        {ends && <span className="opacity-90">Ends {ends}</span>}
        <span className="font-semibold underline underline-offset-2">Book now</span>
      </button>
    </div>
  );
}
