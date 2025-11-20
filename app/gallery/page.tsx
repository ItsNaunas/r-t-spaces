"use client";

import Image from "next/image";
import { useState } from "react";
import { FinalCtaSection, SiteFooter } from "@/components/StudioSections";
import { studioGallery } from "@/lib/studioData";
import { Lightbox } from "@/components/Lightbox";
import { useScrollAnimation } from "@/lib/useScrollAnimation";

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
  if (focus.includes("behind") || focus.includes("lens")) return "Behind the scenes";
  if (focus.includes("corner") || focus.includes("lounge")) return "Studio corners";
  if (focus.includes("booth") || focus.includes("neon")) return "Photobooth";
  if (focus.includes("gear") || focus.includes("lighting")) return "Product";
  return "All";
};

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { ref, isVisible } = useScrollAnimation();

  const filteredGallery = selectedFilter === "All" 
    ? studioGallery 
    : studioGallery.filter(item => getCategory(item) === selectedFilter);

  const handleImageClick = (index: number) => {
    // Find the index in the original gallery array
    const originalIndex = studioGallery.findIndex(
      item => item.src === filteredGallery[index].src
    );
    setCurrentImageIndex(originalIndex >= 0 ? originalIndex : index);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-[var(--base)]">
      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-12 sm:space-y-16 sm:px-6 lg:px-8">
        <section 
          ref={ref}
          className={`space-y-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Gallery
          </p>
          <h1 className="font-heading text-4xl text-[var(--accent)] sm:text-5xl">
            Scenes from recent bookings
          </h1>
          <p className="max-w-3xl text-lg text-[var(--accent)]/80">
            Content teams, photographers, and community builders share the space
            daily. Browse a few of our favorite captures and corners.
          </p>
        </section>

        <section className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em]">
          {categoryFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`border px-4 py-2 transition-all duration-300 ${
                selectedFilter === filter
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--primary)]/10"
                  : "border-[var(--accent)]/30 text-[var(--accent)]/60 hover:border-[var(--accent)]/50 hover:text-[var(--accent)]/80"
              }`}
            >
              {filter}
            </button>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGallery.map((item, index) => (
            <article
              key={`${item.artist}-${index}`}
              className="space-y-3 border border-[var(--accent)]/10 bg-[var(--base)] p-4 cursor-pointer group hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg"
              onClick={() => handleImageClick(index)}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.focus}
                  width={800}
                  height={600}
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
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
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)]/60">
                  {item.focus}
                </p>
                <p className="text-lg font-semibold text-[var(--accent)]">
                  {item.artist}
                </p>
              </div>
            </article>
          ))}
        </section>

        {filteredGallery.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-[var(--accent)]/60">No items found in this category.</p>
          </div>
        )}

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

