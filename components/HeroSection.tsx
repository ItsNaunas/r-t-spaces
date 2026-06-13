"use client";

import Image from "next/image";
import Link from "next/link";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { useState, useEffect, useRef } from "react";

const carouselImages = [
  { src: "/assets/studios/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg", alt: "Studio cyclorama" },
  { src: "/assets/studios/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg", alt: "Studio set" },
  { src: "/assets/studios/IMG_7856.JPG", alt: "Studio interior" },
  { src: "/assets/studios/3f4d65d6-7a25-44cc-a4f4-a1ded7995f3a.jpg", alt: "Studio backdrop" },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] -mt-[73px] flex items-end overflow-hidden bg-[var(--charcoal)]">
      {/* Full-bleed crossfade background */}
      {carouselImages.map((image, index) => (
        <div
          key={image.src}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
          aria-hidden={index !== currentIndex}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Plum gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)] via-[var(--primary)]/70 to-[var(--primary)]/20" />

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14 md:pb-20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.45em] text-[var(--cream)]/80 mb-5">
            RT Spaces · East London
          </p>
          <h1 className="font-heading font-bold uppercase text-white tracking-tight leading-[0.92] text-5xl sm:text-7xl lg:text-8xl max-w-4xl">
            Photography
            <br />
            studio hire
          </h1>
          <p className="mt-6 max-w-xl text-base sm:text-lg text-white/85 leading-relaxed">
            A 5m × 5m studio with professional lighting, backdrops and equipment
            included. Hire by the hour from{" "}
            <span className="font-semibold text-white">£55</span>, or book a full
            session package. Open daily in Manor Park, E12.
          </p>

          {/* Social proof */}
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

          {/* CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
            <BookNowButton
              offer="hire"
              ariaLabel="Hire a studio"
              className="group min-w-[200px] inline-flex items-center justify-center bg-white px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] hover:shadow-xl"
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
              className="min-w-[200px] inline-flex items-center justify-center border border-white/80 bg-transparent px-6 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-white transition-all duration-300 hover:bg-white hover:text-[var(--primary)]"
            >
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
