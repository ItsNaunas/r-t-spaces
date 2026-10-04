"use client";

import { useEffect, useState } from "react";
import type { PublicPromotion } from "@/lib/promotion";

export type LivePromotion = Extract<PublicPromotion, { live: true }>;

// One request per page load, shared by the banner, the pop-up and the wizard.
let request: Promise<LivePromotion | null> | null = null;

function loadPromotion(): Promise<LivePromotion | null> {
  request ??= fetch("/api/promotion")
    .then((r) => r.json())
    .then((data: PublicPromotion) => (data.live ? data : null))
    .catch(() => null);
  return request;
}

/** The live special offer, or null when there isn't one (or it hasn't loaded). */
export function usePromotion(): LivePromotion | null {
  const [promo, setPromo] = useState<LivePromotion | null>(null);
  useEffect(() => {
    let alive = true;
    loadPromotion().then((p) => alive && setPromo(p));
    return () => {
      alive = false;
    };
  }, []);
  return promo;
}
