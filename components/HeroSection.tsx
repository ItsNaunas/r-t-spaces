"use client";

import Image from "next/image";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { useState, useEffect } from "react";

// Bright studio shots for the right panel.
const heroImages = [
  "/assets/studios/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg",
  "/assets/studios/3f4d65d6-7a25-44cc-a4f4-a1ded7995f3a.jpg",
  "/assets/studios/4a6224d3-5683-4361-bef8-5b3b1ab5be56.jpg",
];

export function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[var(--primary)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:min-h-[calc(100svh-73px)]">
        {/* Copy panel */}
        <div
          className="relative z-10 order-1 flex items-center px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-20"
          style={{ background: "linear-gradient(160deg, #46264f 0%, #341a40 55%, #281334 100%)" }}
        >
          <div className="mx-auto w-full max-w-xl lg:mx-0">
            <p className="mb-6 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70">
              Studio hire · East London
            </p>
            <h1 className="font-heading font-bold uppercase tracking-tight leading-[0.95] text-5xl sm:text-6xl lg:text-7xl">
              Photography
              <br />
              studio hire
            </h1>
            <p className="mt-6 max-w-lg text-base sm:text-lg text-white/85 leading-relaxed">
              A fully-equipped 5m × 5m studio with lighting, backdrops and kit
              included. Hire it by the hour from{" "}
              <span className="font-semibold text-white">£55</span>, or book a session
              shot for you. Manor Park, E12. Open daily, 8am to 11pm.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--accent-gold)" }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm md:text-base font-light text-white/80">
                4.9/5 from 200+ creators
              </span>
            </div>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <BookNowButton
                offer="hire"
                ariaLabel="Hire the studio"
                className="group inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
              >
                <span className="flex items-center gap-2">
                  Hire the studio
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </BookNowButton>
              <BookNowButton
                offer="session"
                ariaLabel="Book a session"
                className="inline-flex items-center justify-center rounded-xl border border-white/80 bg-transparent px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-[var(--primary)] sm:px-8 sm:py-4 sm:text-base"
              >
                Book a session
              </BookNowButton>
            </div>
          </div>
        </div>

        {/* Image panel — soft rounded inner corner, gradient seam blend, floating price card */}
        <div className="relative order-2 min-h-[56vh] lg:min-h-full">
          <div className="absolute inset-0 overflow-hidden lg:rounded-l-[2.5rem]">
            {heroImages.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt="The RT Spaces photography studio"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority={i === 0}
                className={`object-cover transition-opacity duration-1000 ease-in-out ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            {/* seam blend + grounding */}
            <div className="absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-[var(--primary)] to-transparent lg:block" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
          </div>

          {/* Floating price card overlapping the seam */}
          <div className="absolute bottom-10 left-6 z-20 hidden rounded-2xl bg-[var(--background)] px-6 py-4 shadow-2xl lg:block lg:-translate-x-1/2">
            <p className="font-heading text-3xl font-bold leading-none text-[var(--primary)]">£55</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[var(--muted-plum)]">
              per hour · studio hire
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
