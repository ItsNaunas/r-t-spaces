/**
 * The time-limited special offer: discounted half/full days, block bookings
 * and the pop-up that advertises them. One record, edited in /admin/promotion
 * and stored in Redis; when it is switched off or its end date passes, every
 * part of it disappears together and the normal packages come back.
 *
 * Pure functions only, so the wizard, the pop-up and the server all price
 * things identically.
 */

import { isWeekendInLondon } from "./pricing";
export { isWeekendInLondon };

export const PROMO_HALF_DAY_ID = "offer-half-day";
export const PROMO_FULL_DAY_ID = "offer-full-day";
export const PROMO_PACKAGE_IDS = [PROMO_HALF_DAY_ID, PROMO_FULL_DAY_ID];

/** Block bookings are booked as this many full days of the offer full day. */
export const BLOCK_EVENT_PACKAGE_ID = PROMO_FULL_DAY_ID;

export type PromoBundle = { days: number; price: number; enabled: boolean };

export type DayPrices = { weekday: number; weekend: number };

export type Promotion = {
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  popupEnabled: boolean;
  headline: string;
  halfDay: DayPrices;
  fullDay: DayPrices;
  bundles: PromoBundle[];
  /** "Was" price per day shown crossed out on block bookings. */
  bundleWasDayRate: number;
  /** Weekend days are only allowed in blocks of at least this many days. */
  weekendMinDays: number;
  /** One backdrop is included per block booking; each extra costs this. */
  extraBackdropPrice: number;
  updatedAt?: string;
};

export const DEFAULT_PROMOTION: Promotion = {
  enabled: false,
  startsAt: null,
  endsAt: null,
  popupEnabled: true,
  headline: "Special offer: studio hire from £50",
  halfDay: { weekday: 50, weekend: 60 },
  fullDay: { weekday: 80, weekend: 100 },
  bundles: [
    { days: 2, price: 149.99, enabled: true },
    { days: 4, price: 299.99, enabled: true },
    { days: 6, price: 349.99, enabled: true },
    { days: 8, price: 599.99, enabled: true },
    { days: 10, price: 649.99, enabled: true },
    { days: 15, price: 999.99, enabled: true },
  ],
  bundleWasDayRate: 80,
  weekendMinDays: 4,
  extraBackdropPrice: 129.99,
};

/** What the public site is told. Nothing here is trusted back from a browser. */
export type PublicPromotion =
  | { live: false }
  | {
      live: true;
      popupEnabled: boolean;
      headline: string;
      endsAt: string | null;
      halfDay: DayPrices;
      fullDay: DayPrices;
      bundles: (PromoBundle & { wasPrice: number })[];
      weekendMinDays: number;
      extraBackdropPrice: number;
    };

export function isPromotionLive(p: Promotion, now: Date = new Date()): boolean {
  if (!p.enabled) return false;
  if (p.startsAt && now < new Date(p.startsAt)) return false;
  if (p.endsAt && now >= new Date(p.endsAt)) return false;
  return true;
}

export function bundleWasPrice(p: Pick<Promotion, "bundleWasDayRate">, days: number): number {
  return round2(days * p.bundleWasDayRate);
}

export function toPublicPromotion(p: Promotion, now: Date = new Date()): PublicPromotion {
  if (!isPromotionLive(p, now)) return { live: false };
  return {
    live: true,
    popupEnabled: p.popupEnabled,
    headline: p.headline,
    endsAt: p.endsAt,
    halfDay: p.halfDay,
    fullDay: p.fullDay,
    bundles: p.bundles
      .filter((b) => b.enabled)
      .sort((a, b) => a.days - b.days)
      .map((b) => ({ ...b, wasPrice: bundleWasPrice(p, b.days) })),
    weekendMinDays: p.weekendMinDays,
    extraBackdropPrice: p.extraBackdropPrice,
  };
}

/** Lowest advertised price, for "from £X". */
export function promoFromPrice(p: Pick<Promotion, "halfDay" | "fullDay">): number {
  return Math.min(p.halfDay.weekday, p.halfDay.weekend, p.fullDay.weekday, p.fullDay.weekend);
}

// ─── Dates (the studio is in London; customers may not be) ───────────────────

const londonDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD of an instant, in London. */
export function londonDateKey(iso: string | Date): string {
  return londonDate.format(new Date(iso));
}

/** Weekend-ness of a calendar date key (YYYY-MM-DD), independent of timezone. */
export function isWeekendDateKey(key: string): boolean {
  const d = new Date(`${key}T12:00:00Z`).getUTCDay();
  return d === 0 || d === 6;
}

// ─── Validation for the admin form ────────────────────────────────────────────

export type PromotionCheck = { errors: string[]; warnings: string[] };

export function checkPromotion(p: Promotion): PromotionCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const money = (n: number) => `£${n.toFixed(2)}`;

  for (const [label, v] of [
    ["Weekday half day", p.halfDay.weekday],
    ["Weekend half day", p.halfDay.weekend],
    ["Weekday full day", p.fullDay.weekday],
    ["Weekend full day", p.fullDay.weekend],
    ["Crossed-out day rate", p.bundleWasDayRate],
  ] as const) {
    if (!(v > 0)) errors.push(`${label} must be more than £0.`);
  }
  if (!(p.extraBackdropPrice >= 0)) errors.push("Extra backdrop price can't be negative.");
  if (!Number.isInteger(p.weekendMinDays) || p.weekendMinDays < 1) {
    errors.push("Weekend minimum must be a whole number of days, 1 or more.");
  }
  if (p.startsAt && p.endsAt && new Date(p.endsAt) <= new Date(p.startsAt)) {
    errors.push("The end date must be after the start date.");
  }
  if (p.enabled && !p.endsAt) {
    warnings.push("No end date set, so the offer will run until you switch it off.");
  }

  const seen = new Set<number>();
  for (const b of p.bundles) {
    if (!Number.isInteger(b.days) || b.days < 2 || b.days > 30) {
      errors.push(`Block bookings must be between 2 and 30 days (got ${b.days}).`);
    }
    if (seen.has(b.days)) errors.push(`There are two ${b.days}-day block bookings.`);
    seen.add(b.days);
    if (!(b.price > 0)) errors.push(`${b.days}-day block price must be more than £0.`);
    const was = bundleWasPrice(p, b.days);
    if (b.price >= was) {
      warnings.push(
        `${b.days} days at ${money(b.price)} is not a discount: the crossed-out price is ${money(was)}.`
      );
    }
  }

  // A bigger block should never cost more per day than a smaller one, or
  // customers will just book the smaller blocks instead.
  const live = p.bundles.filter((b) => b.enabled && b.days > 0 && b.price > 0)
    .sort((a, b) => a.days - b.days);
  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const small = live[i];
      const big = live[j];
      if (big.price / big.days > small.price / small.days + 0.005) {
        warnings.push(
          `${big.days} days costs ${money(big.price / big.days)}/day but ${small.days} days costs ` +
            `${money(small.price / small.days)}/day. Customers will book the smaller block instead.`
        );
      }
    }
  }

  return { errors, warnings };
}

/** Coerce an untrusted admin payload into a Promotion. */
export function parsePromotion(input: unknown): Promotion {
  const o = (input ?? {}) as Record<string, unknown>;
  const num = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? round2(n) : fallback;
  };
  const date = (v: unknown) => {
    if (typeof v !== "string" || !v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };
  const prices = (v: unknown, fallback: DayPrices): DayPrices => {
    const x = (v ?? {}) as Record<string, unknown>;
    return { weekday: num(x.weekday, fallback.weekday), weekend: num(x.weekend, fallback.weekend) };
  };
  const d = DEFAULT_PROMOTION;
  return {
    enabled: o.enabled === true,
    startsAt: date(o.startsAt),
    endsAt: date(o.endsAt),
    popupEnabled: o.popupEnabled !== false,
    headline: typeof o.headline === "string" && o.headline.trim()
      ? o.headline.trim().slice(0, 120)
      : d.headline,
    halfDay: prices(o.halfDay, d.halfDay),
    fullDay: prices(o.fullDay, d.fullDay),
    bundles: Array.isArray(o.bundles)
      ? o.bundles.slice(0, 20).map((b) => {
          const x = (b ?? {}) as Record<string, unknown>;
          return {
            days: Math.floor(Number(x.days) || 0),
            price: num(x.price, 0),
            enabled: x.enabled !== false,
          };
        })
      : d.bundles,
    bundleWasDayRate: num(o.bundleWasDayRate, d.bundleWasDayRate),
    weekendMinDays: Math.floor(Number(o.weekendMinDays) || d.weekendMinDays),
    extraBackdropPrice: num(o.extraBackdropPrice, d.extraBackdropPrice),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Add whole days to a YYYY-MM-DD key. */
export function addDaysToKey(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "4 November" — the last day of the offer, in London. */
export function formatPromoEnd(endsAt: string | null): string | null {
  if (!endsAt) return null;
  return new Date(endsAt).toLocaleDateString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "long",
  });
}
