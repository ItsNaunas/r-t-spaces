"use client";

import Image from "next/image";
import Link from "next/link";
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
    <section className="grid lg:grid-cols-2 lg:min-h-[calc(100svh-73px)]">
      {/* Copy panel */}
      <div className="order-1 flex items-center bg-[var(--primary)] px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <p className="mb-5 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70">
            RT Spaces · Photography studio hire · East London
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

      {/* Image panel — full height, bleeds to the edge, gentle crossfade */}
      <div className="relative order-2 min-h-[56vh] lg:min-h-full">
        {heroImages.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt="The RT Spaces photography studio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={i === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
