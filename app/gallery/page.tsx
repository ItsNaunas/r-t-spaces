"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { studioGallery } from "@/lib/studioData";
import { Lightbox } from "@/components/Lightbox";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { GradientBars } from "@/components/ui/gradient-bars";

const categoryFilters = [
  "All",
  "Behind the scenes",
  "Studio corners",
  "Photobooth",
  "Product",
];

// Map gallery items to categories (simplified - you can enhance this)
const getCategory = (item: typeof studioGallery[0]) => {
  const focus = item.focus.toLowerCase();
  if (focus.includes("behind") || focus.includes("lens") || focus.includes("tethered")) return "Behind the scenes";
  if (focus.includes("corner") || focus.includes("lounge") || focus.includes("styled")) return "Studio corners";
  if (focus.includes("booth") || focus.includes("neon") || focus.includes("photo")) return "Photobooth";
  if (focus.includes("gear") || focus.includes("lighting") || focus.includes("props")) return "Product";
  return "All";
};

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: galleryRef, isVisible: galleryVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <div className="bg-[var(--base)]">
      {/* Hero Header Section - Matching Homepage Style */}
      <section 
        className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-hidden"
        style={{ backgroundColor: 'var(--hero-background)' }}
      >
        <GradientBars colors={['var(--primary)', 'transparent']} />
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={headerRef}
            className={`max-w-4xl transition-all duration-700 ${
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--primary)]/80 mb-4 sm:mb-6">
              Gallery
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[var(--primary)] leading-tight mb-6 sm:mb-8">
              Scenes from recent bookings
            </h1>
            <p className="text-lg sm:text-xl text-[var(--primary)]/90 leading-relaxed max-w-3xl">
              Content teams, photographers, and community builders share the space
              daily. Browse a few of our favorite captures and corners.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation Section - Matching Equipment Page */}
      <section 
        id="filter-section"
        className="bg-white py-16 md:py-20 lg:py-24 relative z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Tab Navigation */}
          <div className="mb-10 md:mb-14">
            <div className="border-b-2 border-[var(--lavender)]">
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                {categoryFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap border-b-2 ${
                      selectedFilter === filter
                        ? "text-[var(--primary)] font-semibold border-[var(--primary)] -mb-[2px]"
                        : "text-[var(--muted-plum)] hover:text-[var(--primary)] border-transparent"
                    }`}
                    aria-selected={selectedFilter === filter}
                    role="tab"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Panels */}
          <div className="relative min-h-[500px]">
            {categoryFilters.map((filter) => {
              const filteredItems = filter === "All" 
                ? studioGallery 
                : studioGallery.filter(item => getCategory(item) === filter);
              
              const isActive = selectedFilter === filter;
              
              return (
                <div
                  key={filter}
                  role="tabpanel"
                  aria-hidden={!isActive}
                  className={`transition-opacity duration-500 ease-in-out ${
                    isActive 
                      ? "opacity-100 relative z-10" 
                      : "opacity-0 absolute inset-0 pointer-events-none invisible"
                  }`}
                >
                  {filteredItems.length > 0 ? (
                    <div 
                      ref={isActive ? galleryRef : null}
                      className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
                    >
                      {filteredItems.map((item, index) => {
                        // Find the index in the original gallery array for lightbox
                        const originalIndex = studioGallery.findIndex(
                          galleryItem => galleryItem.src === item.src
                        );
                        
                        return (
                          <div
                            key={`${item.artist}-${index}`}
                            className="group"
                          >
                            {/* Photo Frame Effect - Image inside frame */}
                            <div 
                              className="relative w-full cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]"
                              onClick={() => {
                                setCurrentImageIndex(originalIndex >= 0 ? originalIndex : 0);
                                setLightboxOpen(true);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setCurrentImageIndex(originalIndex >= 0 ? originalIndex : 0);
                                  setLightboxOpen(true);
                                }
                              }}
                              aria-label={`View ${item.focus} by ${item.artist}`}
                            >
                              {/* Physical Frame Border - Purple outer border */}
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
                                {/* Frame inner bevel/edge highlight */}
                                <div 
                                  className="absolute inset-0"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.2) 100%)',
                                    pointerEvents: 'none'
                                  }}
                                ></div>
                                
                                {/* Gold stroke border */}
                                <div 
                                  className="absolute inset-3 pointer-events-none z-10"
                                  style={{
                                    border: '4px solid var(--accent-gold)',
                                    opacity: 0.9
                                  }}
                                ></div>
                                
                                {/* Image Container - the actual photo */}
                                <div className="relative aspect-[4/3] overflow-hidden" style={{ 
                                  margin: '12px',
                                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.15)'
                                }}>
                                  <Image
                                    src={item.src}
                                    alt={item.focus}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading={isActive ? "eager" : "lazy"}
                                    quality={85}
                                    priority={isActive && index < 6}
                                  />
                                  {/* Hover overlay */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                    <svg 
                                      className="h-10 w-10 sm:h-12 sm:w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                  </div>
                                  {/* Subtle gradient overlay for depth */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-[var(--accent-gold)]/5 pointer-events-none"></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Image Info - Visible on mobile and desktop */}
                            <div className="mt-4 sm:mt-5 text-center space-y-3">
                              <div>
                                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[var(--muted-plum)] mb-1">
                                  {item.focus}
                                </p>
                                <p className="text-sm sm:text-base font-semibold text-[var(--primary)]">
                                  {item.artist}
                                </p>
                              </div>
                              <Link 
                                href="/book-online" 
                                className="inline-block btn-primary btn-small"
                              >
                                Check Availability
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 sm:py-20">
                      <p className="text-lg sm:text-xl text-[var(--muted-plum)]">
                        No items found in this category.
                      </p>
                      <button
                        onClick={() => setSelectedFilter("All")}
                        className="mt-6 btn-secondary"
                      >
                        View All Images
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <FinalCtaSection />
      
      {/* Footer */}
      <SiteFooter />
      
      {/* Lightbox */}
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

