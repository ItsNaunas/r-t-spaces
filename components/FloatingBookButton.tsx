"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function FloatingBookButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show button after scrolling past hero section (approximately 100vh)
      const shouldShow = scrollY > window.innerHeight * 0.5;
      setIsVisible(shouldShow);
      setHasScrolled(scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <Link
      href="/book-online"
      className={`fixed z-50 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{
        bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        right: 'calc(1.5rem + env(safe-area-inset-right, 0px))',
      }}
      aria-label="Book Online"
    >
      <div className="btn-primary shadow-lg hover:shadow-xl group relative overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
          <svg
            className="h-5 w-5 transition-transform group-hover:scale-110"
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
          Book Now
        </span>
      </div>
    </Link>
  );
}

