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
    // Check if script already exists
    let script = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]') as HTMLScriptElement;
    
    if (!script) {
      // Load Calendly embed script
      script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const handleLoad = () => setIsLoaded(true);
    if (script.complete) {
      setIsLoaded(true);
    } else {
      script.onload = handleLoad;
    }

    // Listen for Calendly events
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf("calendly") === 0) {
        if (e.data.event === "calendly.event_scheduled" && onEventScheduled) {
          onEventScheduled(e.data);
        }
      }
    };

    window.addEventListener("message", handleCalendlyEvent);

    return () => {
      window.removeEventListener("message", handleCalendlyEvent);
    };
  }, [onEventScheduled]);

  if (!url) {
    return (
      <div className="border-2 border-[var(--primary)]/40 bg-white p-8 text-center text-[var(--muted-plum)]">
        <p>Calendly scheduling link not configured. Please set NEXT_PUBLIC_CALENDLY_SCHEDULING_LINK in your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="w-full calendly-widget-container">
      <div
        ref={calendlyRef}
        className="calendly-inline-widget w-full"
        data-url={url}
        style={{ 
          minHeight: "700px",
          height: "700px"
        }}
      />
    </div>
  );
}

