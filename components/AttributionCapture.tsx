"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE,
  attributionFromVisit,
  chooseAttribution,
  decodeAttribution,
  encodeAttribution,
} from "@/lib/attribution";

/**
 * Records where this visitor came from (see lib/attribution.ts). Runs on each
 * full page load; client-side navigation keeps the first page's referrer, and
 * an existing record is only replaced by a tagged link.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const raw = document.cookie
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith(`${ATTRIBUTION_COOKIE}=`))
        ?.slice(ATTRIBUTION_COOKIE.length + 1);
      const existing = decodeAttribution(raw);
      const next = chooseAttribution(existing, attributionFromVisit(window.location.href, document.referrer));
      if (!next || (existing && encodeAttribution(existing) === encodeAttribution(next))) return;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${ATTRIBUTION_COOKIE}=${encodeURIComponent(encodeAttribution(next))}; Max-Age=${ATTRIBUTION_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    } catch {
      // Cookies blocked: the booking is recorded as "unknown".
    }
  }, []);
  return null;
}
