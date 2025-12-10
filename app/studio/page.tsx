"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FinalCtaSection,
  SiteFooter,
  GallerySection,
} from "@/components/StudioSections";
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
    value: "Teddy77723@gmail.com · 07944667000",
  },
];

export default function StudioPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Section - Matching Home Page Style */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--primary) 0%, oklch(0.50 0.06 312) 50%, oklch(0.70 0.05 312) 100%)'
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
              <p className="text-sm uppercase tracking-[0.4em] text-white/80">
                Studio
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
                Take a tour of <span className="font-script italic">R&T Spaces</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Designed for content days, lookbooks, and community events, our East
                London studio mixes daylight with controlled lighting so you can
                pivot between clean commercial looks and warm lifestyle scenes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/book-online" className="btn-primary">
                  Book This Studio
                </Link>
                <Link href="/equipment" className="bg-white text-[var(--primary)] hover:bg-white/90 border-2 border-white px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm sm:text-sm tracking-[0.05em] transition-all duration-300 inline-flex items-center justify-center">
                  View Equipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full">
        {/* Gallery Section - Using Component with Photo Frames */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-sm uppercase tracking-wider mb-3 text-[var(--muted-plum)]">
                • Studio Gallery
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-[var(--primary)]">
                Corners ready for your <span className="font-script italic">lens</span>
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {studioGallery.map((item, index) => (
                <div
                  key={item.artist}
                  className="group cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  {/* Photo Frame Effect */}
                  <div className="relative w-full">
                    <div 
                      className="relative"
                      style={{
                        background: 'linear-gradient(145deg, rgba(61, 35, 80, 0.95) 0%, rgba(45, 25, 60, 0.98) 50%, rgba(61, 35, 80, 0.95) 100%)',
                        boxShadow: `
                          0 20px 60px rgba(0, 0, 0, 0.15),
                          0 8px 16px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                        `,
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        padding: '12px'
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.2) 100%)',
                          pointerEvents: 'none'
                        }}
                      ></div>
                      
                      <div 
                        className="absolute inset-3 pointer-events-none z-10"
                        style={{
                          border: '4px solid var(--accent-gold)',
                          opacity: 0.9
                        }}
                      ></div>
                      
                      <div className="relative aspect-[4/3] overflow-hidden" style={{ 
                        margin: '12px',
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.15)'
                      }}>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--accent-gold)]/5 pointer-events-none"></div>
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
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              {/* Left: Large Studio Image with Photo Frame */}
              <div className="relative">
                <div className="relative aspect-[4/3]">
                  {/* Photo Frame Effect */}
                  <div className="relative w-full h-full">
                    <div 
                      className="absolute inset-0 p-8 md:p-12"
                      style={{
                        background: 'linear-gradient(145deg, rgba(61, 35, 80, 0.95) 0%, rgba(45, 25, 60, 0.98) 50%, rgba(61, 35, 80, 0.95) 100%)',
                        boxShadow: `
                          0 20px 60px rgba(0, 0, 0, 0.3),
                          0 8px 16px rgba(0, 0, 0, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                        `,
                        border: '1px solid rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.2) 100%)',
                          pointerEvents: 'none'
                        }}
                      ></div>
                      
                      <div 
                        className="absolute inset-4 pointer-events-none z-10"
                        style={{
                          border: '6px solid var(--accent-gold)',
                          opacity: 0.9
                        }}
                      ></div>
                      
                      <div className="absolute inset-4 overflow-hidden" style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.15)' }}>
                        <Image
                          src="/assets/44919513-a2a5-4595-af6d-e23e0acb2a87.jpg"
                          alt="R&T Spaces studio overview"
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/2 via-transparent to-[var(--accent-gold)]/2 pointer-events-none"></div>
                      </div>
                    </div>
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
                      className="border-t border-[var(--lavender)] pt-6"
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

        {/* Studio Services Section - Matching Home Page Style */}
        <section 
          className="py-16 md:py-24 lg:py-32"
          style={{
            backgroundColor: 'var(--primary)'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 md:mb-16">
              <p className="text-sm uppercase tracking-wider mb-3 text-white/80">
                • Our Services
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">What We </span>
                <span className="font-script text-white/80">Offer</span>
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {studioServices.map((service, index) => (
                <div
                  key={service.title}
                  className="bg-white p-8 border-t-4 border-[var(--lavender)] shadow-lg hover:shadow-xl transition-shadow duration-300"
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
              <p className="text-sm uppercase tracking-wider mb-3 text-[var(--muted-plum)]">
                • Everything Included
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-[var(--primary)]">
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
          className="py-16 md:py-24 lg:py-32 text-center"
          style={{
            background: 'linear-gradient(180deg, var(--primary) 0%, oklch(0.50 0.06 312) 50%, oklch(0.70 0.05 312) 100%)'
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white">
                Ready to Book This Studio?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                Reserve your studio time today. All equipment is included and ready
                before your call time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/book-online" className="btn-primary bg-white text-[var(--primary)] hover:bg-white/90 border-2 border-white">
                  Book This Studio
                </Link>
                <Link href="/equipment" className="bg-white text-[var(--primary)] hover:bg-white/90 border-2 border-white px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm sm:text-sm tracking-[0.05em] transition-all duration-300 inline-flex items-center justify-center">
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
