"use client";

import Image from "next/image";
import { BookNowButton } from "@/components/booking/BookNowButton";

export function HeroSection() {
  return (
    <section className="-mt-[73px] w-full">
      {/* SECTION 1 — full-bleed image, runs up behind the transparent nav.
          Rounded bottom dips into the band (soft seam). */}
      <div className="relative z-10 h-[64vh] min-h-[480px] w-full overflow-hidden rounded-b-[2.5rem] sm:h-[72vh]">
        <Image
          src="/assets/hero/studio-hero.jpg"
          alt="The RT Spaces photography studio"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* SECTION 2 — white band tucked under the image's rounded bottom */}
      <div className="relative -mt-10 bg-white px-6 pb-12 pt-16 text-[var(--primary)] sm:px-10 lg:-mt-12 lg:px-16 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
            {/* LEFT — eyebrow + dominant headline */}
            <div>
              <p className="mb-5 text-xs sm:text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                Photography studio hire · East London
              </p>
              <h1 className="font-heading font-bold uppercase tracking-tight leading-[0.92] text-4xl text-[var(--primary)] sm:text-6xl lg:text-7xl">
                Your studio,
                <br />
                ready to shoot
              </h1>
            </div>

            {/* RIGHT — copy, trust indicators, CTAs */}
            <div>
              <p className="max-w-md text-base sm:text-lg text-[var(--muted-plum)] leading-relaxed">
                A 5m × 5m studio with the lighting, backdrops and kit already set up.
                Hire by the hour from{" "}
                <span className="font-semibold text-[var(--primary)]">£55</span>, or have us
                shoot it for you.
              </p>

              {/* Trust indicators: rating · customers · availability */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-[var(--primary)]">
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: "var(--accent-gold)" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                  4.9/5
                </span>
                <span className="text-[var(--muted-plum)]/40">·</span>
                <span className="text-[var(--muted-plum)]">200+ creators served</span>
                <span className="text-[var(--muted-plum)]/40">·</span>
                <span className="text-[var(--muted-plum)]">Open daily, 8am to 11pm</span>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <BookNowButton
                  offer="hire"
                  ariaLabel="Hire the studio"
                  className="group inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--primary)]/90 hover:scale-[1.02] hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
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
                  className="inline-flex items-center justify-center rounded-full border border-[var(--primary)] bg-transparent px-6 py-3.5 text-sm font-medium text-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)] hover:text-white sm:px-8 sm:py-4 sm:text-base"
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
