"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FinalCtaSection,
  SiteFooter,
} from "@/components/StudioSections";
import { BookNowButton } from "@/components/booking/BookNowButton";
import { studioGallery, studioServices } from "@/lib/studioData";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { Lightbox } from "@/components/Lightbox";
import { GradientBars } from "@/components/ui/gradient-bars";

const studioHighlights = [
  {
    title: "Cyclorama + sets",
    detail:
      "Seamless white, textured concrete, and a cozy lounge corner ready for talent holding.",
  },
  {
    title: "Lighting & grip",
    detail:
      "Continuous LEDs, strobes, stands, modifiers, tethering table, and rolling wardrobe rack.",
  },
  {
    title: "Amenities",
    detail:
      "Dressing area, steamer, Bluetooth audio, kitchenette, and complimentary tea & coffee.",
  },
];

const availabilityBlocks = [
  {
    label: "Open hours",
    value: "Daily · 8 AM – 11 PM",
  },
  {
    label: "Address",
    value: "Unit 3E, 736-740 Romford Road, London E12 6BT",
  },
  {
    label: "Contact",
    value: "enquires@rtspaces.co.uk · 07944667000",
  },
];

export default function StudioPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Section - Matching Pricing Page Style */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: 'var(--hero-background)'
        }}
      >
        <GradientBars colors={['var(--primary)', 'transparent']} />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div 
            ref={heroRef}
            className={`transition-all duration-700 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80">
                Studio
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[var(--primary)] leading-tight">
                Take a tour of RT Spaces
              </h1>
              <p className="text-lg sm:text-xl text-[var(--primary)]/90 max-w-3xl mx-auto leading-relaxed">
                Designed for content days, lookbooks, and community events, our East
                London studio mixes daylight with controlled lighting so you can
                pivot between clean commercial looks and warm lifestyle scenes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <BookNowButton className="btn-primary">
                  Book This Studio
                </BookNowButton>
                <Link href="/equipment" className="rounded-full border border-white bg-transparent text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm">
                  View Equipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full">
        {/* Gallery Section - Using Component with Photo Frames */}
        <section className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-3">
                Studio Gallery
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[var(--primary)]">
                Corners ready for your lens
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {studioGallery.map((item, index) => (
                <div
                  key={item.artist}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${item.focus}`}
                  className="group cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCurrentImageIndex(index);
                      setLightboxOpen(true);
                    }
                  }}
                >
                  {/* Photo Frame Effect - Purple frame */}
                  <div className="relative w-full bg-white shadow-2xl overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--primary)' }}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.focus}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <svg 
                          className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <figcaption className="text-sm text-[var(--muted-plum)] mt-4 text-center">
                    {item.focus}
                  </figcaption>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Studio Image with Highlights - Photo Frame Style */}
        <section className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              {/* Left: Large Studio Image with Photo Frame */}
              <div className="relative">
                <div className="relative aspect-[4/3]">
                  {/* Photo Frame Effect - Purple frame */}
                  <div className="relative w-full h-full bg-white shadow-2xl overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--primary)' }}>
                    <Image
                      src="/assets/44919513-a2a5-4595-af6d-e23e0acb2a87.jpg"
                      alt="RT Spaces studio overview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Right: Highlights */}
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-3xl sm:text-4xl text-[var(--primary)] mb-4">
                    Ready before you arrive
                  </h2>
                  <p className="text-lg text-[var(--muted-plum)] leading-relaxed">
                    Send through a mood board and we&apos;ll stage the space, pre-light
                    sets, and prepare any photobooth wraps or props ahead of call time.
                  </p>
                </div>
                <div className="space-y-4">
                  {studioHighlights.map((item, index) => (
                    <div
                      key={item.title}
                      className="border-t border-[var(--primary)] pt-6"
                    >
                      <div className="flex gap-6">
                        <div className="text-base font-semibold text-[var(--muted-plum)]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-2">
                            {item.title}
                          </p>
                          <p className="text-base text-[var(--primary)] leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Availability Blocks */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {availabilityBlocks.map((item) => (
                <div
                  key={item.label}
                  className="border-t-2 border-[var(--primary)] pt-6 text-center"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-3">
                    {item.label}
                  </p>
                  <p className="text-base sm:text-lg text-[var(--primary)] font-medium normal-case">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Studio Services Section - Purple Background */}
        <section 
          className="py-16 md:py-24 lg:py-32"
          style={{
            backgroundColor: 'var(--primary)'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-xs uppercase tracking-[0.4em] text-white/80 mb-3">
                Our Services
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                <span className="text-white">What We </span>
                <span className="font-heading text-white/80">Offer</span>
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {studioServices.map((service, index) => (
                <div
                  key={service.title}
                  className="bg-white p-8 rounded-2xl border-t-4 border-[var(--primary)] shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="text-lg font-semibold text-[var(--muted-plum)]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-2">
                        {service.title}
                      </p>
                      <p className="text-lg text-[var(--primary)] leading-relaxed">{service.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipment & Backdrops Section - Consolidated */}
        <section className="py-16 md:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-3">
                Everything Included
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[var(--primary)]">
                Equipment & Backdrops
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Lighting Equipment */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl text-[var(--primary)] border-t-2 border-[var(--primary)] pt-4">
                  Lighting Equipment
                </h3>
                <ul className="space-y-3 text-[var(--muted-plum)]">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Professional softboxes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Continuous LEDs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Strobes & modifiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Diffusers & reflectors</span>
                  </li>
                </ul>
              </div>

              {/* Studio Equipment */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl text-[var(--primary)] border-t-2 border-[var(--primary)] pt-4">
                  Studio Equipment
                </h3>
                <ul className="space-y-3 text-[var(--muted-plum)]">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Light stands & grip</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Tethering station</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Rolling wardrobe rack</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Steamer</span>
                  </li>
                </ul>
              </div>

              {/* Available Backdrops */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl text-[var(--primary)] border-t-2 border-[var(--primary)] pt-4">
                  Available Backdrops
                </h3>
                <ul className="space-y-3 text-[var(--muted-plum)]">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>White cyclorama (seamless)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Textured grey backdrop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Colour backdrop rolls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lifestyle setups & styled corners</span>
                  </li>
                </ul>
              </div>

              {/* Props Available */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl text-[var(--primary)] border-t-2 border-[var(--primary)] pt-4">
                  Props Available
                </h3>
                <ul className="space-y-3 text-[var(--muted-plum)]">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Stools & plinths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Furniture pieces</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Neon photo booth wall</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Styling accessories</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Book This Studio CTA */}
        <section 
          className="relative py-16 md:py-24 lg:py-32 text-center overflow-hidden"
          style={{
            backgroundColor: 'var(--hero-background)'
          }}
        >
          <GradientBars colors={['var(--primary)', 'transparent']} />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[var(--primary)]">
                Ready to Book This Studio?
              </h2>
              <p className="text-lg sm:text-xl text-[var(--primary)]/90 leading-relaxed">
                Reserve your studio time today. All equipment is included and ready
                before your call time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <BookNowButton className="btn-primary">
                  Book This Studio
                </BookNowButton>
                <Link href="/equipment" className="rounded-full border border-white bg-transparent text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm">
                  View Equipment
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FinalCtaSection />
        <SiteFooter />
      </main>

      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={studioGallery.map(item => ({ src: item.src, alt: item.artist, artist: item.artist, focus: item.focus }))}
        currentIndex={currentImageIndex}
        onNavigate={setCurrentImageIndex}
      />
    </div>
  );
}
