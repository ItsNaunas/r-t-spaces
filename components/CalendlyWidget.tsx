"use client";

import { useEffect, useRef, useState } from "react";

type CalendlyGlobal = {
  initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void;
};

type CalendlyScheduledEvent = {
  event: string;
  payload: {
    event_type: string;
    invitee: { email: string; name: string; uri: string };
    scheduled_event: { start_time: string; end_time: string; location: string };
    event: { uri: string };
  };
};

interface CalendlyWidgetProps {
  url: string;
  onEventScheduled?: (event: CalendlyScheduledEvent) => void;
}

export function CalendlyWidget({ url, onEventScheduled }: CalendlyWidgetProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep the latest callback in a ref so the init effect can depend only on
  // `url` — otherwise a parent re-render (the callback is recreated each render)
  // would tear down and rebuild the widget, wiping an in-progress selection.
  const onEventRef = useRef(onEventScheduled);
  useEffect(() => {
    onEventRef.current = onEventScheduled;
  }, [onEventScheduled]);

  useEffect(() => {
    const container = calendlyRef.current;
    if (!url || !container) return;

    let cancelled = false;

    const handleCalendlyEvent = (e: MessageEvent) => {
      // Only trust messages from Calendly.
      if (typeof e.origin !== "string" || !e.origin.includes("calendly.com")) return;
      const data = e.data as CalendlyScheduledEvent | undefined;
      if (data?.event === "calendly.event_scheduled") {
        onEventRef.current?.(data);
      }
    };
    window.addEventListener("message", handleCalendlyEvent);

    // The widget mounts dynamically (only on the date step), after Calendly's
    // script already auto-scanned the page, so we must initialise it ourselves.
    const init = (): boolean => {
      const Calendly = (window as unknown as { Calendly?: CalendlyGlobal }).Calendly;
      if (!Calendly || !container) return false;
      container.innerHTML = "";
      Calendly.initInlineWidget({ url, parentElement: container });
      return true;
    };

    let pollId: ReturnType<typeof setInterval> | undefined;
    const stopPolling = () => {
      if (pollId) {
        clearInterval(pollId);
        pollId = undefined;
      }
    };
    if (!init()) {
      pollId = setInterval(() => {
        if (cancelled) return;
        if (init()) stopPolling();
      }, 200);
    }

    // Hide the spinner once the injected iframe actually loads.
    let iframeCleanup: (() => void) | undefined;
    const attachIframe = () => {
      const iframe = container.querySelector("iframe");
      if (!iframe) return false;
      const done = () => setIsLoaded(true);
      iframe.addEventListener("load", done);
      iframeCleanup = () => iframe.removeEventListener("load", done);
      return true;
    };
    const observer = new MutationObserver(() => {
      if (attachIframe()) observer.disconnect();
    });
    observer.observe(container, { childList: true, subtree: true });

    // Safety net: stop polling and reveal the widget if the load event is missed.
    const fallback = setTimeout(() => {
      stopPolling();
      setIsLoaded(true);
    }, 8000);

    return () => {
      cancelled = true;
      stopPolling();
      observer.disconnect();
      iframeCleanup?.();
      clearTimeout(fallback);
      window.removeEventListener("message", handleCalendlyEvent);
    };
  }, [url]);

  if (!url) {
    return (
      <div className="rounded-2xl border-2 border-[var(--primary)]/40 bg-white p-8 text-center text-[var(--muted-plum)]">
        <p>Calendly scheduling link not configured. Please set NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK in your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full calendly-widget-container" style={{ minHeight: "700px" }}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-[var(--muted-plum)]">
          <svg className="h-8 w-8 animate-spin text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading available times…</p>
        </div>
      )}
      {/* keeps the .calendly-inline-widget iframe CSS rules applying */}
      <div
        ref={calendlyRef}
        className="calendly-inline-widget w-full"
        style={{ minHeight: "700px", height: "700px" }}
      />
    </div>
  );
}
