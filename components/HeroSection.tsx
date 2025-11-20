"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden -mt-[73px] pt-[73px] bg-black w-full max-w-full">
      {/* Hero Image Background with Parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          willChange: "transform",
        }}
      >
        <Image
          src="/assets/9664d1b7-9f9a-4c82-bf63-5befb91b0102(1).jpg"
          alt="R&T Spaces studio"
          fill
          className="object-cover scale-110"
          priority
        />
      </div>

      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

      {/* Centered content with massive spacing */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center text-white z-10">
        <div className="flex flex-col items-center animate-fade-in-up">
          <h1 
            className="font-heading text-6xl font-bold leading-[1.1] sm:text-7xl md:text-8xl lg:text-9xl max-w-6xl mx-auto mb-8"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
              opacity: Math.max(0, 1 - scrollY / 400),
            }}
          >
            Book your perfect studio space
          </h1>
          <p className="mt-8 text-xl font-medium uppercase tracking-[0.25em] sm:text-2xl md:text-3xl max-w-3xl mx-auto leading-relaxed opacity-95">
            Professional studio hire for your creative projects
          </p>
          <div className="mt-16">
            <Link
              href="/contact"
              className="btn-primary group relative overflow-hidden text-lg px-8 py-4"
              style={{
                background: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: 'var(--base)',
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                BOOK YOUR SESSION
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Subtle Trust Indicator - positioned below CTA in normal flow */}
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-white/70">
            {/* Star Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-4 w-4 sm:h-5 sm:w-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm sm:text-base font-medium">4.9/5</span>
            </div>
            
            {/* Separator - hidden on mobile */}
            <span className="hidden sm:inline text-white/30">•</span>
            
            {/* Trust Quote - subtle and minimal */}
            <div className="text-center sm:text-left max-w-xs sm:max-w-md">
              <p className="text-xs sm:text-sm italic leading-relaxed text-white/80">
                &quot;Professional equipment, amazing lighting&quot;
              </p>
              <p className="text-xs text-white/50 mt-1">— 500+ Creators</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
