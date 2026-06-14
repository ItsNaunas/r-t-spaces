"use client";

import { useEffect, useRef, useState } from "react";

interface CalendlyWidgetProps {
  url: string;
  onEventScheduled?: (event: {
    event: string;
    payload: {
      event_type: string;
      invitee: {
        email: string;
        name: string;
        uri: string;
      };
      scheduled_event: {
        start_time: string;
        end_time: string;
        location: string;
      };
      event: {
        uri: string;
      };
    };
  }) => void;
}

export function CalendlyWidget({ url, onEventScheduled }: CalendlyWidgetProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf("calendly") === 0) {
        if (e.data.event === "calendly.event_scheduled" && onEventScheduled) {
          onEventScheduled(e.data);
        }
      }
    };
    window.addEventListener("message", handleCalendlyEvent);

    // Keep the spinner up until Calendly's iframe has actually rendered + loaded
    // (the script is loaded globally on page-load, so tracking the script alone
    // would hide the spinner before the widget is visible).
    const container = calendlyRef.current;
    let iframeCleanup: (() => void) | undefined;
    const attach = () => {
      const iframe = container?.querySelector("iframe");
      if (!iframe) return false;
      const done = () => setIsLoaded(true);
      iframe.addEventListener("load", done);
      iframeCleanup = () => iframe.removeEventListener("load", done);
      return true;
    };

    let observer: MutationObserver | undefined;
    if (!attach() && container) {
      observer = new MutationObserver(() => {
        if (attach()) observer?.disconnect();
      });
      observer.observe(container, { childList: true, subtree: true });
    }

    // Safety net: never leave the spinner hanging if the load event is missed.
    const fallback = setTimeout(() => setIsLoaded(true), 6000);

    return () => {
      window.removeEventListener("message", handleCalendlyEvent);
      observer?.disconnect();
      iframeCleanup?.();
      clearTimeout(fallback);
    };
  }, [onEventScheduled]);

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
      <div
        ref={calendlyRef}
        className="calendly-inline-widget w-full"
        data-url={url}
        style={{
          minHeight: "700px",
          height: "700px",
        }}
      />
    </div>
  );
}

