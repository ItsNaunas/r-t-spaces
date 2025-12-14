"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function FloatingBookButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show button after scrolling a bit
      const shouldShow = scrollY > 100;
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show on all screen sizes - fixed at bottom of page
  return (
    <Link
      href="/#contact"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-full pointer-events-none"
      }`}
      style={{
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
        paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))',
      }}
      aria-label="Book Online"
    >
      <div className="btn-cta shadow-lg hover:shadow-xl w-full text-center max-w-7xl mx-auto">
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Book Online
        </span>
      </div>
    </Link>
  );
}

