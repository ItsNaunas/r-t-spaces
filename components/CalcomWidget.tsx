"use client";

import { useEffect, useRef, useState } from "react";

/** Normalised booking result, so the wizard never sees Cal.com's raw payload shape. */
export type CalBookingSuccess = {
  uid: string;
  startTime: string;
  endTime: string;
  name?: string;
  email?: string;
};

type CalGlobal = ((...args: unknown[]) => void) & {
  ns?: Record<string, (...args: unknown[]) => void>;
  loaded?: boolean;
  q?: unknown[];
};

interface CalcomWidgetProps {
  /** "username/event-slug", e.g. "rtspaces/standard-rate". */
  calLink: string;
  /** Minutes. Only meaningful for multi-duration event types (hourly hire). */
  duration?: number;
  onBookingSuccessful?: (booking: CalBookingSuccess) => void;
}

const EMBED_SRC = "https://app.cal.com/embed/embed.js";

/**
 * Installs Cal.com's official bootstrap: a queueing `window.Cal` stub that
 * loads embed.js on first use. embed.js requires this stub to already exist
 * ("Cal is not defined. This shouldn't happen") and replays the queued calls,
 * so loading the script on its own leaves the calendar blank.
 */
function installCalStub(): CalGlobal {
  const w = window as unknown as { Cal?: CalGlobal };
  if (w.Cal) return w.Cal;

  type Queue = ((...args: unknown[]) => void) & { q: unknown[] };
  const push = (api: Queue, args: unknown) => api.q.push(args);

  const cal = function (...args: unknown[]) {
    const self = w.Cal as CalGlobal & Queue;
    if (!self.loaded) {
      self.ns = {};
      self.q = self.q || [];
      const script = document.createElement("script");
      script.src = EMBED_SRC;
      script.async = true;
      document.head.appendChild(script);
      self.loaded = true;
    }
    if (args[0] === "init") {
      const namespace = args[1];
      if (typeof namespace === "string") {
        const api = function (...a: unknown[]) {
          push(api as Queue, a);
        } as Queue;
        api.q = [];
        self.ns![namespace] = self.ns![namespace] || api;
        push(self.ns![namespace] as Queue, args);
        push(self, ["initNamespace", namespace]);
      } else {
        push(self, args);
      }
      return;
    }
    push(self, args);
  } as CalGlobal;

  w.Cal = cal;
  return cal;
}

/** The Cal global, plus a promise that rejects if embed.js itself fails to load. */
function loadCalEmbed(): Promise<CalGlobal> {
  return Promise.resolve(installCalStub());
}

function watchEmbedScript(onError: () => void): () => void {
  const script = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`);
  script?.addEventListener("error", onError);
  return () => script?.removeEventListener("error", onError);
}

/**
 * Cal.com's payload shape has moved around between embed versions, so pull the
 * fields out defensively rather than trusting one path. Returning null is
 * treated as "not a usable booking" by the caller.
 */
type Loose = Record<string, unknown>;

const asRecord = (v: unknown): Loose | null =>
  typeof v === "object" && v !== null ? (v as Loose) : null;

/** First present, non-empty string among the given keys. */
const pick = (o: Loose, ...keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
};

function normalise(detail: unknown): CalBookingSuccess | null {
  const outer = asRecord(detail);
  const data = asRecord(outer?.data);
  const b =
    asRecord(data?.booking) ?? data ?? asRecord(outer?.booking) ?? outer;
  if (!b) return null;

  const uid = pick(b, "uid", "bookingUid", "id");
  const startTime = pick(b, "startTime", "start", "start_time");
  const endTime = pick(b, "endTime", "end", "end_time");
  if (!uid || !startTime || !endTime) return null;

  const attendee = Array.isArray(b.attendees) ? asRecord(b.attendees[0]) : null;
  return {
    uid,
    startTime,
    endTime,
    name: (attendee && pick(attendee, "name")) ?? pick(b, "name"),
    email: (attendee && pick(attendee, "email")) ?? pick(b, "email"),
  };
}

export function CalcomWidget({ calLink, duration, onBookingSuccessful }: CalcomWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Keep the latest callback in a ref so the init effect depends only on the
  // booking parameters. A parent re-render must not tear down an in-progress
  // selection.
  const onBookingRef = useRef(onBookingSuccessful);
  useEffect(() => {
    onBookingRef.current = onBookingSuccessful;
  }, [onBookingSuccessful]);

  useEffect(() => {
    const container = containerRef.current;
    if (!calLink || !container) return;

    let cancelled = false;
    let unwatch = () => {};
    // One namespace per link+duration, so switching package cleanly rebuilds
    // rather than stacking listeners on a shared instance.
    const namespace = `rts-${calLink.replace(/[^a-z0-9]/gi, "-")}-${duration ?? "fixed"}`;

    loadCalEmbed()
      .then((Cal) => {
        if (cancelled) return;
        container.innerHTML = "";

        Cal("init", namespace, { origin: "https://app.cal.com" });
        // The first call above injects embed.js; a blocked or failed load
        // means the calendar can never appear.
        unwatch = watchEmbedScript(() => !cancelled && setFailed(true));
        const ns = Cal.ns?.[namespace];
        if (!ns) {
          setFailed(true);
          return;
        }

        ns("inline", {
          elementOrSelector: container,
          calLink,
          config: {
            layout: "month_view",
            ...(duration ? { duration: String(duration) } : {}),
          },
        });

        // Cal.com emits both events; V2 reliably carries the uid and times.
        // Whichever arrives first wins, the other is ignored by uid.
        let handledUid = "";
        const onBooked = (e: { detail?: unknown }) => {
          const booking = normalise(e?.detail);
          if (!booking || booking.uid === handledUid) return;
          handledUid = booking.uid;
          onBookingRef.current?.(booking);
        };
        ns("on", { action: "bookingSuccessfulV2", callback: onBooked });
        ns("on", { action: "bookingSuccessful", callback: onBooked });

        ns("on", {
          action: "linkReady",
          callback: () => setIsLoaded(true),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    // Safety net: reveal the widget even if linkReady never fires.
    const fallback = setTimeout(() => setIsLoaded(true), 8000);

    return () => {
      cancelled = true;
      unwatch();
      clearTimeout(fallback);
      container.innerHTML = "";
    };
  }, [calLink, duration]);

  if (!calLink) {
    return (
      <div className="rounded-2xl border-2 border-[var(--primary)]/40 bg-white p-8 text-center text-[var(--muted-plum)]">
        <p>Booking calendar is not configured. Set NEXT_PUBLIC_CAL_USERNAME in the environment.</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-2xl border-2 border-[var(--primary)]/40 bg-white p-8 text-center text-[var(--muted-plum)]">
        <p>We could not load the calendar. Please refresh, or email enquires@rtspaces.co.uk and we will book you in.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ minHeight: "700px" }}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-[var(--muted-plum)]">
          <svg className="h-8 w-8 animate-spin text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading available times…</p>
        </div>
      )}
      <div ref={containerRef} className="w-full" style={{ minHeight: "700px" }} />
    </div>
  );
}
