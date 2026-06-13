"use client";

import Image from "next/image";
import Link from "next/link";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { useState, useEffect } from "react";

// Each framing card rotates through its own set of studio shots.
const cardSets = [
  ["/assets/studios/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg", "/assets/studios/IMG_7856.JPG"],
  ["/assets/studios/4a6224d3-5683-4361-bef8-5b3b1ab5be56.jpg", "/assets/studios/IMG_7858.JPG"],
  ["/assets/studios/3f4d65d6-7a25-44cc-a4f4-a1ded7995f3a.jpg", "/assets/studios/IMG_7860.JPG"],
  ["/assets/studios/09221174-0c46-4aa0-92c0-ee51b9af5ca4.jpg", "/assets/studios/IMG_7861.JPG"],
];

function RotatingFrame({
  images,
  delay,
  className,
  priority = false,
}: {
  images: string[];
  delay: number;
  className?: string;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 6000);
    }, delay);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [images.length, delay]);

  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 shadow-2xl ${className ?? ""}`}>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Scene from the RT Spaces studio"
          fill
          sizes="(max-width: 1024px) 45vw, 24vw"
          priority={priority && i === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative -mt-[73px] flex min-h-screen items-center overflow-hidden bg-[var(--primary)] pt-[73px] text-white">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Copy — full width on mobile, center two columns on desktop */}
          <div className="col-span-2 mb-4 text-center lg:col-start-2 lg:row-start-1 lg:mb-0 lg:self-center">
            <p className="text-xs sm:text-sm uppercase tracking-[0.45em] text-white/70 mb-5">
              RT Spaces · East London
            </p>
            <h1 className="font-heading font-bold uppercase tracking-tight leading-[0.95] text-5xl sm:text-7xl xl:text-8xl">
              Photography
              <br />
              studio hire
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed">
              A 5m × 5m studio with professional lighting, backdrops and equipment
              included. Hire by the hour from{" "}
              <span className="font-semibold text-white">£55</span>, or book a full
              session. Open daily in Manor Park, E12.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
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

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <BookNowButton
                offer="hire"
                ariaLabel="Hire a studio"
                className="group inline-flex min-w-[200px] items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
              >
                <span className="flex items-center gap-2">
                  Hire a Studio
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </BookNowButton>
              <Link
                href="/studio"
                className="inline-flex min-w-[200px] items-center justify-center rounded-xl border border-white/80 bg-transparent px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-[var(--primary)] sm:px-8 sm:py-4 sm:text-base"
              >
                View Packages
              </Link>
            </div>
          </div>

          {/* Framing cards — 2x2 on mobile; A/D flank the copy, B/C sit below it on desktop */}
          <RotatingFrame images={cardSets[0]} delay={0} priority className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-center" />
          <RotatingFrame images={cardSets[1]} delay={1500} className="lg:col-start-2 lg:row-start-2" />
          <RotatingFrame images={cardSets[2]} delay={3000} className="lg:col-start-3 lg:row-start-2" />
          <RotatingFrame images={cardSets[3]} delay={4500} className="lg:col-start-4 lg:row-start-1 lg:row-span-2 lg:self-center" />
        </div>
      </div>
    </section>
  );
}
