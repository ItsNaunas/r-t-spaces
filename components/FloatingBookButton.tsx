"use client";

import { useState, useEffect } from "react";
import { useBooking } from "@/components/booking/BookingProvider";

export function FloatingBookButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      }`}
      style={{
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
        paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
      }}
    >
      <button
        type="button"
        onClick={() => openBooking()}
        aria-label="Book Online"
        className="btn-cta shadow-lg hover:shadow-xl w-full text-center max-w-7xl mx-auto"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Book my slot
        </span>
      </button>
    </div>
  );
}
