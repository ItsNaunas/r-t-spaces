"use client";

import Image from "next/image";
import { BookNowButton } from "@/components/booking/BookNowButton";

export function HeroSection() {
  return (
    <section className="-mt-[73px] w-full">
      {/* SECTION 1 — full-bleed image, runs up behind the transparent nav */}
      <div className="relative h-[64vh] min-h-[480px] w-full sm:h-[72vh]">
        <Image
          src="/assets/hero/studio-hero.jpg"
          alt="The RT Spaces photography studio"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* SECTION 2 — plum band, rounded top rises into the image (soft seam),
          straight bottom edge ends the hero */}
      <div className="relative z-10 -mt-8 rounded-t-[2.5rem] bg-[var(--primary)] px-6 py-12 text-white sm:px-10 lg:-mt-12 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
            {/* LEFT — eyebrow + dominant headline */}
            <div>
              <p className="mb-5 text-xs sm:text-sm uppercase tracking-[0.4em] text-white/70">
                Studio hire · East London
              </p>
              <h1 className="font-heading font-bold uppercase tracking-tight leading-[0.92] text-4xl sm:text-6xl lg:text-7xl">
                Photography
                <br />
                studio hire
              </h1>
            </div>

            {/* RIGHT — copy, trust indicators, CTAs */}
            <div>
              <p className="max-w-md text-base sm:text-lg text-white/90 leading-relaxed">
                A fully-equipped 5m × 5m studio with lighting, backdrops and kit
                included. Hire it by the hour from{" "}
                <span className="font-semibold text-white">£55</span>, or book a session
                shot for you. Manor Park, E12.
              </p>

              {/* Trust indicators: rating · customers · availability */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--accent-gold)" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                  4.9/5
                </span>
                <span className="text-white/40">·</span>
                <span className="text-white/85">200+ creators served</span>
                <span className="text-white/40">·</span>
                <span className="text-white/85">Open daily, 8am to 11pm</span>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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
        </div>
      </div>
    </section>
  );
}
