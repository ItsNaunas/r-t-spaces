"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { Lightbox } from "@/components/Lightbox";

const valueList = [
  {
    label: "Daylight-ready studio",
    detail: "White cyclorama plus styled corners for clean or cozy sets.",
  },
  {
    label: "Plug-and-play kit",
    detail: "Lighting, stands, and vanity zones prepped before call time.",
  },
  {
    label: "Flexible booking windows",
    detail: "Open daily 8 AM – 11 PM for short-form sprints or long productions.",
  },
  {
    label: "Photobooth add-ons",
    detail: "Brandable booth experiences for launches, pop-ups, and parties.",
  },
];

export const studioServices = [
  {
    title: "Studio Hire",
    meta: "Hourly + daily rates · East London · Equipment included",
  },
  {
    title: "Creative Session",
    meta: "Resident photographer, tethered capture, direction support",
  },
  {
    title: "Photobooth Packages",
    meta: "Neon wall, instant prints, on-site host",
  },
];

export const studioGallery = [
  {
    artist: "Behind the Lens",
    focus: "Tethered capture",
    src: "/assets/71d985ec-e79d-4ac5-89e4-f5785077064a.jpg",
  },
  {
    artist: "Rose on Set",
    focus: "Content day",
    src: "/assets/9664d1b7-9f9a-4c82-bf63-5befb91b0102.jpg",
  },
  {
    artist: "Studio Corners",
    focus: "Styled lounge",
    src: "/assets/aaeebd1e-e1b8-4548-9052-39a53a169559.jpg",
  },
  {
    artist: "Gear Prep",
    focus: "Lighting ready",
    src: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
  },
  {
    artist: "Minimal Props",
    focus: "Stools & plinths",
    src: "/assets/9450092a-7996-44d5-87f7-ec9281017f5d.jpg",
  },
  {
    artist: "Neon Motto",
    focus: "Photo booth wall",
    src: "/assets/00cb384c-557d-425f-ae56-72d83509cef7.jpg",
  },
];

export function StorySection() {
  return (
    <section className="bg-[var(--base)] px-2 py-12 sm:px-4 lg:px-0">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            About R&amp;T Spaces
          </p>
          <h2 className="font-heading text-4xl leading-tight text-[var(--accent)] lg:text-5xl">
            A home for creators, brand launches, and portrait sessions in East
            London.
          </h2>
          <p className="text-lg text-[var(--accent)]/80">
            Founded by Rose &amp; Teddy, R&amp;T Spaces pairs a calming studio
            with ready-to-roll equipment so you can focus on directing talent,
            shooting content, or hosting clients.
          </p>
        </div>
        <div className="grid gap-6">
          {valueList.map((value, index) => (
            <div
              key={value.label}
              className="flex gap-5 border-t border-[var(--accent)]/20 pt-6"
            >
              <div className="text-sm font-semibold text-[var(--accent)]/60">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <p className="font-semibold text-[var(--accent)]">{value.label}</p>
                <p className="text-sm text-[var(--accent)]/80">{value.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MissionSection() {
  return (
    <section className="grid gap-10 bg-[var(--base)] px-2 py-12 sm:px-4 lg:grid-cols-2 lg:px-0">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
          Translate your vision
        </p>
        <h3 className="font-heading text-4xl text-[var(--accent)]">
          Pick the service that fits your shoot day.
        </h3>
        <p className="text-lg text-[var(--accent)]/80">
          Whether you need four walls and great light or prefer our crew to jump
          in, we tailor bookings to your run sheet and deliverables.
        </p>
        <Link
          href="/contact"
          className="btn-primary btn-small"
        >
          Book studio
        </Link>
      </div>
      <div className="space-y-6">
        <div className="overflow-hidden bg-[var(--accent)]/5">
          <Image
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
            alt="Creative direction"
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-[360px] w-full object-cover sm:h-[420px]"
            loading="lazy"
            quality={85}
          />
        </div>
        <div className="border border-[var(--accent)]/20 p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Our services
          </p>
          <div className="mt-6 space-y-5">
            {studioServices.map((service) => (
              <div key={service.title} className="border-t border-[var(--accent)]/20 pt-4">
                <p className="font-semibold text-[var(--accent)]">{service.title}</p>
                <p className="text-sm text-[var(--accent)]/80">{service.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedWorkSection() {
  return (
    <section className="bg-[var(--base)] px-2 py-12 sm:px-4 lg:px-0">
      <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
        See our work
      </p>
      <h3 className="mt-4 font-heading text-4xl text-[var(--accent)] lg:text-5xl">
        Glimpses from the studio floor.
      </h3>

      <div className="mt-10 overflow-hidden bg-[var(--accent)]">
        <Image
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
          alt="Featured project"
          width={1400}
          height={800}
          sizes="(max-width: 768px) 100vw, 100vw"
          className="h-[320px] w-full object-cover sm:h-[420px]"
          priority
          quality={85}
        />
      </div>

      <div className="mt-8 grid gap-6 border-t border-[var(--accent)]/20 pt-8 text-sm text-[var(--accent)]/80 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)]/60">
            Featured Session
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--accent)]">
            InTheSpotlight Content Day
          </p>
        </div>
        <p className="lg:col-span-2">
          Tethered capture, seamless wardrobe changes, and styled corners that
          keep creators comfortable while delivering polished imagery.
        </p>
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold text-[var(--accent)]">Location:</span> Unit 3E,
            736-740 Romford Road, London
          </p>
          <p>
            <span className="font-semibold text-[var(--accent)]">Hours:</span> Open daily
            8 AM – 11 PM
          </p>
        </div>
      </div>
    </section>
  );
}

export function GallerySection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { ref, isVisible } = useScrollAnimation();

  return (
    <>
      <section className="bg-[var(--base)] px-2 py-12 sm:px-4 lg:px-0">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-3xl text-[var(--accent)]">Studio Archive</h3>
          <Link
            href="https://www.instagram.com/randtspace"
            className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
            target="_blank"
          >
            Follow @randtspace →
          </Link>
        </div>
        <div 
          ref={ref}
          className={`mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {studioGallery.map((item, index) => (
            <article
              key={item.artist}
              className="space-y-3 border border-[var(--accent)]/10 bg-[var(--base)] p-4 shadow-[inset_0_0_0_1px_var(--base)] cursor-pointer group hover:border-[var(--primary)] transition-all duration-300"
              onClick={() => {
                setCurrentImageIndex(index);
                setLightboxOpen(true);
              }}
            >
              <div className="overflow-hidden relative">
                <Image
                  src={item.src}
                  alt={item.artist}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  quality={85}
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
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
                  {item.focus}
                </p>
                <p className="text-xl font-semibold text-[var(--accent)]">{item.artist}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={studioGallery.map(item => ({ src: item.src, alt: item.artist, artist: item.artist, focus: item.focus }))}
        currentIndex={currentImageIndex}
        onNavigate={setCurrentImageIndex}
      />
    </>
  );
}

export function FinalCtaSection() {
  return (
    <section className="grid gap-6 bg-[var(--primary)] px-6 py-12 text-[var(--base)] sm:px-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <p className="text-sm uppercase tracking-[0.5em] text-[var(--base)]/80">
          Ready when you are
        </p>
        <h3 className="mt-4 font-heading text-4xl">
          Book R&amp;T Spaces for your next shoot
        </h3>
      </div>
      <div className="flex items-center justify-end">
        <Link
          href="/contact"
          className="btn-secondary"
          style={{ borderColor: 'var(--base)', color: 'var(--base)' }}
        >
          Message us
        </Link>
      </div>
    </section>
  );
}

// Studio preview videos for marquee
const studioPreviewVideos = [
  "/assets/20251028_131356.mp4",
  "/assets/20251028_131503.mp4",
  "/assets/20251028_131543.mp4",
  "/assets/20251028_131640.mp4",
  "/assets/20251028_131713.mp4",
  "/assets/20251028_131741.mp4",
  "/assets/20251028_131808.mp4",
  "/assets/20251028_132117.mp4",
  "/assets/20251028_132128.mp4",
  "/assets/20251028_132143.mp4",
  "/assets/20251028_132355.mp4",
  "/assets/20251028_132407.mp4",
  "/assets/20251028_132419.mp4",
  "/assets/20251028_143237.mp4",
];

// Video carousel images
const videoCarouselImages = [
  "/assets/1d5ab5d7-44b6-4a18-b709-56dffe7a2eab.mp4",
  "/assets/23c0c110-d369-4ae8-bd28-c9e6b78e5fa1.mp4",
  "/assets/3786f80c-4258-4e64-9e88-c92da28fe942.mp4",
  "/assets/42239ee3-caac-4b9b-9702-825000004018.mp4",
];

// Instagram images for social proof
const instagramImages = [
  "/assets/00cb384c-557d-425f-ae56-72d83509cef7.jpg",
  "/assets/041d64cf-da31-4924-bea4-0aa2823648f6.jpg",
  "/assets/1f96f7e5-8759-4f14-8f74-7677f828e019.jpg",
  "/assets/2a18f8ef-1393-4f8a-acfe-b6b8eb5a1cee.jpg",
  "/assets/2c432d2e-bfd8-4632-810b-ce75af0f8287.jpg",
  "/assets/2e94519f-81c1-4889-8e20-d33581fb17ef.jpg",
  "/assets/4aca7aa7-e1b2-4b69-8438-c9484fa5bb71.jpg",
  "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
  "/assets/5cd64b86-f29d-4b35-8806-162c18542a5b.jpg",
  "/assets/6191004c-40dd-4cc2-92ac-85eefb30dbad.jpg",
];

export function StudioPreviewsGrid() {
  const { ref, isVisible } = useScrollAnimation();
  const [visibleVideos, setVisibleVideos] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-video-index') || '0');
            setVisibleVideos((prev) => new Set([...prev, index]));
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const videoElements = document.querySelectorAll('[data-video-index]');
      videoElements.forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      const videoElements = document.querySelectorAll('[data-video-index]');
      videoElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <section className="bg-[var(--base)] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div 
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-heading text-5xl font-bold text-[var(--accent)] sm:text-6xl md:text-7xl mb-6">
            Studio Spaces
          </h2>
          <p className="text-xl text-[var(--accent)]/70 max-w-2xl mx-auto">
            Premium spaces designed for seamless content creation
          </p>
        </div>
        
        {/* Marquee Container */}
        <div className="relative overflow-hidden mb-12 hover-scroll-pause">
          <div className="flex animate-marquee gap-6">
            {/* First set of videos */}
            {studioPreviewVideos.map((src, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 group relative" data-video-index={index}>
                <video
                  autoPlay={visibleVideos.has(index)}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="h-[400px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    if (visibleVideos.has(index)) {
                      video.playbackRate = 0.5;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    if (visibleVideos.has(index)) {
                      video.playbackRate = 1;
                    }
                  }}
                  onError={(e) => {
                    console.error('Video load error:', e);
                  }}
                >
                  {visibleVideos.has(index) && <source src={src} type="video/mp4" />}
                </video>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {studioPreviewVideos.map((src, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 group relative" data-video-index={index}>
                <video
                  autoPlay={visibleVideos.has(index)}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="h-[400px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    if (visibleVideos.has(index)) {
                      video.playbackRate = 0.5;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    if (visibleVideos.has(index)) {
                      video.playbackRate = 1;
                    }
                  }}
                  onError={(e) => {
                    console.error('Video load error:', e);
                  }}
                >
                  {visibleVideos.has(index) && <source src={src} type="video/mp4" />}
                </video>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <Link
            href="/studio"
            className="btn-secondary inline-flex items-center gap-2"
          >
            View our studio
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function VideoCarouselSection() {
  return (
    <section className="bg-[var(--base)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {videoCarouselImages.map((src, index) => (
            <div key={index} className="group relative aspect-video overflow-hidden">
              <Image
                src={src}
                alt={`Video thumbnail ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
                loading="lazy"
                quality={80}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/40 opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-12 w-12 text-[var(--base)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Bookings2025Section() {
  const stats = [
    { label: "Booked this month", value: "48+" },
    { label: "Available slots", value: "Open" },
    { label: "Studio hours", value: "8 AM - 11 PM" },
  ];

  const features = [
    { icon: "✓", text: "Flexible hourly & daily rates" },
    { icon: "✓", text: "All equipment included" },
    { icon: "✓", text: "Professional lighting setup" },
  ];

  return (
    <section className="bg-[var(--base)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 bg-[var(--accent)]/5 p-8 lg:p-12">
          <p className="font-heading text-3xl font-bold text-[var(--accent)] sm:text-4xl">
            Ready to create? Book your 2025 studio time now.
          </p>
          <p className="text-lg text-[var(--accent)]/80">
            Our East London studio is ready for content days, lookbooks, and brand launches. Flexible hourly and daily rates available—book your slot today.
          </p>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-[var(--primary)] font-bold text-xl">{feature.icon}</span>
                <span className="text-[var(--accent)]/80">{feature.text}</span>
              </div>
            ))}
          </div>
          <Link
            href="/contact"
            className="btn-primary inline-flex"
          >
            BOOK NOW
            <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="hidden lg:flex flex-col justify-center gap-8">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-[var(--base)] border-2 border-[var(--accent)]/10 rounded-lg">
                <p className="font-heading text-3xl font-bold text-[var(--primary)] mb-2">{stat.value}</p>
                <p className="text-sm text-[var(--accent)]/70 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80"
              alt="Studio booking space"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
              quality={85}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Studio Space",
      description: "Browse our range of equipped spaces. From seamless white cyclorama to cozy lounge corners—pick the vibe that matches your vision.",
      image: "/assets/6191004c-40dd-4cc2-92ac-85eefb30dbad.jpg",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Arrive & Create",
      description: "Our team greets you on arrival. We've prepped lighting, stands, and refreshments. Just bring your creativity—we handle the rest.",
      image: "/assets/62408639-2e32-466b-9174-3ab6cff5e3ae.jpg",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Join the Community",
      description: "Become a member for monthly studio access at member rates, plus weekly newsletters with exclusive discounts and creative inspiration.",
      image: "/assets/8eb25501-7cc0-4ccf-a906-3a2a747836fd.jpg",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-[var(--base)] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div 
          ref={ref}
          className={`mb-20 text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-sm font-medium uppercase tracking-wider text-[var(--accent)]/60 mb-6">
            HOW IT WORKS
          </p>
          <h2 className="font-heading text-5xl font-bold text-[var(--accent)] sm:text-6xl md:text-7xl">
            Start your content creation journey
          </h2>
        </div>
        <div className="grid gap-20 md:grid-cols-3">
          {steps.map((step, index) => {
            const StepCard = ({ step, index }: { step: typeof steps[0], index: number }) => {
              const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
              return (
                <div 
                  ref={ref}
                  className={`space-y-6 transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="mb-4">
                    <p className="font-heading text-7xl font-bold text-[var(--accent)] leading-none">{step.number}</p>
                  </div>
                  <div className="relative aspect-square overflow-hidden group">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      quality={85}
                    />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-[var(--accent)] mt-8">{step.title}</h3>
                  <p className="text-lg text-[var(--accent)]/70 leading-relaxed">{step.description}</p>
                </div>
              );
            };
            return <StepCard key={step.number} step={step} index={index} />;
          })}
        </div>
      </div>
    </section>
  );
}

export function TestimonialSection() {
  const testimonials = [
    {
      quote: "The perfect space for maternity, mum & me sessions. The studio spaces are beautifully designed and incredibly versatile.",
      author: "Sarah K.",
      role: "Portrait Photographer",
      rating: 5,
      date: "January 2025",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "Professional equipment, amazing lighting, and the team made everything seamless. Highly recommend for any content creator.",
      author: "Michael T.",
      role: "Content Creator",
      rating: 5,
      date: "December 2024",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "R&T Spaces transformed our brand shoot. The lighting setup was flawless, and the team's attention to detail made all the difference.",
      author: "Emma R.",
      role: "Brand Creative Director",
      rating: 5,
      date: "November 2024",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "Incredible attention to detail and the most welcoming team. The studio felt like a second home during our week-long production.",
      author: "James L.",
      role: "Film Director",
      rating: 5,
      date: "October 2024",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "The cyclorama is pristine, and the natural light combined with their professional setup creates magic. Worth every penny.",
      author: "Sophie M.",
      role: "Fashion Photographer",
      rating: 5,
      date: "September 2024",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "I've booked multiple sessions here and each time it gets better. The team really understands what creators need.",
      author: "David P.",
      role: "Product Photographer",
      rating: 5,
      date: "August 2024",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "The best studio experience I've had in London. Professional, clean, and inspiring space that elevates every shoot.",
      author: "Lisa W.",
      role: "Commercial Photographer",
      rating: 5,
      date: "July 2024",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    },
    {
      quote: "From the moment we walked in, everything was perfect. The lighting, the space, the vibe—everything exceeded expectations.",
      author: "Mark H.",
      role: "Content Creator",
      rating: 5,
      date: "June 2024",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-[var(--primary)] fill-current' : 'text-[var(--base)]/20'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  // Split testimonials into two rows for marquee
  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  // Duplicate arrays for seamless loop
  const firstRowDuplicated = [...firstRow, ...firstRow];
  const secondRowDuplicated = [...secondRow, ...secondRow];

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <div className="bg-[var(--accent)] p-8 shadow-[0_8px_32px_rgba(60,36,20,0.12)] mb-6 flex-shrink-0">
      {/* Avatar and Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative h-12 w-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--primary)]/30">
          <Image
            src={testimonial.avatar}
            alt={testimonial.author}
            width={48}
            height={48}
            sizes="48px"
            className="object-cover"
            loading="lazy"
            quality={75}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-[var(--base)] truncate">
            {testimonial.author}
          </p>
          <p className="text-sm text-[var(--base)]/70 truncate">
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-5">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Quote */}
      <p className="font-heading text-xl text-[var(--base)] mb-6 leading-relaxed">
        &quot;{testimonial.quote}&quot;
      </p>

      {/* Date */}
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--base)]/50">
        {testimonial.date}
      </p>
    </div>
  );

  return (
    <section className="bg-[var(--base)] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          {/* Left Column: Editorial Content */}
          <div className="flex flex-col justify-center space-y-8">
            <p className="text-sm uppercase tracking-[0.4em] text-[var(--accent)]/60">
              Community Voices
            </p>
            <h2 className="font-heading text-4xl leading-tight text-[var(--accent)] lg:text-5xl">
              What creators are saying about R&T Spaces
            </h2>
            <p className="text-lg text-[var(--accent)]/80 leading-relaxed">
              From portrait sessions to brand launches, our community of photographers and creators share their experiences working in our East London studio.
            </p>
            <Link
              href="/contact"
              className="btn-secondary w-fit"
            >
              Book studio
            </Link>
          </div>

          {/* Right Column: Two-Row Vertical Marquee */}
          <div className="relative flex h-[600px] w-full flex-row items-center justify-center gap-6 overflow-hidden hover-scroll-pause">
            {/* First Column - Moving Down */}
            <div className="flex flex-col animate-marquee-vertical">
              {firstRowDuplicated.map((testimonial, index) => (
                <TestimonialCard key={`first-${index}`} testimonial={testimonial} />
              ))}
            </div>

            {/* Second Column - Moving Up */}
            <div className="flex flex-col animate-marquee-vertical-reverse">
              {secondRowDuplicated.map((testimonial, index) => (
                <TestimonialCard key={`second-${index}`} testimonial={testimonial} />
              ))}
            </div>

            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[var(--base)]"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[var(--base)]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LatestNewsSection() {
  return (
    <section className="bg-[var(--base)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-4xl font-bold text-[var(--accent)] sm:text-5xl md:text-6xl">
          Latest News
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80"
              alt="New studio room"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
              quality={85}
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="px-3 py-1 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider rounded">
                NEW STUDIO
              </span>
              <time className="text-sm text-[var(--accent)]/60" dateTime="2024-12-01">
                December 2024
              </time>
            </div>
            <h3 className="font-heading text-3xl font-bold text-[var(--accent)] sm:text-4xl">
              We have officially launched Unit 3E Studio
            </h3>
            <p className="text-lg text-[var(--accent)]/80">
              Our newest studio space in East London features a seamless white cyclorama, textured concrete walls, and a cozy lounge corner. Equipped with professional lighting, continuous LEDs, and all the amenities you need for a successful shoot day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="btn-primary w-fit"
              >
                BOOK NOW
                <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/studio"
                className="text-[var(--primary)] font-semibold uppercase tracking-wider text-sm hover:underline flex items-center gap-2 w-fit"
              >
                Learn about Unit 3E
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialProofSection() {
  const stats = [
    { value: 500, suffix: "+", label: "Creators" },
    { value: 4.9, suffix: "/5", label: "Rating", isDecimal: true },
    { value: 50, suffix: "+", label: "Bookings this month" },
  ];

  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="bg-[var(--base)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60 mb-2">
            Join the community
          </p>
          <h2 className="font-heading text-3xl font-bold text-[var(--accent)] sm:text-4xl">
            Join 500+ creators who&apos;ve chosen R&T Spaces
          </h2>
        </div>
        <div 
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((stat, index) => (
            <AnimatedStatCard key={index} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

type StatType = {
  value: number;
  suffix: string;
  label: string;
  isDecimal?: boolean;
};

function AnimatedStatCard({ stat, isVisible }: { stat: StatType, isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = stat.value;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setCount(stat.isDecimal ? parseFloat(currentValue.toFixed(1)) : Math.floor(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, stat.value, stat.isDecimal]);

  return (
    <div className="text-center p-8 bg-[var(--accent)]/5 rounded-lg border-2 border-[var(--accent)]/10 hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg">
      <p className="font-heading text-5xl font-bold text-[var(--primary)] mb-2">
        {count}{stat.suffix}
      </p>
      <p className="text-lg text-[var(--accent)]/80 uppercase tracking-wider">{stat.label}</p>
    </div>
  );
}

export function WhyChooseUsSection() {
  const features = [
    {
      title: "Daylight-ready",
      description: "Natural light meets professional lighting",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "All-inclusive kit",
      description: "Lighting, stands, and vanity zones ready",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: "Flexible hours",
      description: "Open daily 8 AM - 11 PM",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Expert support",
      description: "On-call team for shoot day questions",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-[var(--base)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]/60 mb-2">
            Why Choose Us
          </p>
          <h2 className="font-heading text-4xl font-bold text-[var(--accent)] sm:text-5xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-lg text-[var(--accent)]/80 max-w-2xl mx-auto">
            Professional spaces designed for seamless content creation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4 p-6 bg-[var(--base)] border-2 border-[var(--accent)]/10 rounded-lg hover:border-[var(--primary)] transition-colors">
              <div className="flex justify-center">
                <div className="p-4 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-[var(--accent)]">{feature.title}</h3>
              <p className="text-[var(--accent)]/80 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudioFeaturesSection() {
  const features = [
    {
      title: "Pro Lighting",
      description: "Every session includes our complete professional lighting kit. High-end softboxes for soft, even illumination, continuous LEDs for video work, diffusers and reflectors for precise control, plus strobes and modifiers. All equipment is prepped and ready before your call time, so you can focus on capturing the perfect shot without technical delays.",
      image: "/assets/5448c683-ea0d-43cb-8ca6-c407b47ba93e.jpg",
      imageAlt: "Professional lighting equipment setup",
    },
    {
      title: "Multiple Backdrops",
      description: "Switch between looks effortlessly with our versatile backdrop collection. Start with the seamless white cyclorama for clean commercial shots, move to textured grey for editorial depth, or choose from our curated colour rolls and lifestyle setups. Each backdrop is professionally hung and ready to use, giving you the flexibility to pivot your creative direction mid-shoot.",
      image: "/assets/aaeebd1e-e1b8-4548-9052-39a53a169559.jpg",
      imageAlt: "Multiple backdrop options in studio",
    },
    {
      title: "Studio Amenities",
      description: "Beyond the shooting space, we've designed every detail for comfort and efficiency. A dedicated changing area with full-length mirrors, a cozy lounge corner for talent breaks, complimentary refreshments, high-speed WiFi, and a tethering station for immediate review. Everything you need to keep your production running smoothly from start to finish.",
      image: "/assets/71d985ec-e79d-4ac5-89e4-f5785077064a.jpg",
      imageAlt: "Studio amenities and facilities",
    },
  ];

  return (
    <section className="bg-[var(--base)] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 text-center">
          <h2 className="font-heading text-5xl font-bold text-[var(--accent)] sm:text-6xl md:text-7xl mb-6">
            What&apos;s Included in Your Session
          </h2>
        </div>
        <div className="space-y-32">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            const { ref, isVisible } = useScrollAnimation();
            return (
              <div
                key={index}
                ref={ref}
                className={`grid gap-12 lg:grid-cols-2 lg:gap-20 items-center transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {/* Text Content */}
                <div
                  className={`space-y-8 px-4 sm:px-8 lg:px-12 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <h3 className="font-heading text-4xl sm:text-5xl font-bold text-[var(--accent)]">
                    {feature.title}
                  </h3>
                  <p className="text-lg sm:text-xl text-[var(--accent)]/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {/* Image */}
                <div
                  className={`relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden group ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    quality={85}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function GiveUsAFollowSection() {
  return (
    <section className="bg-[var(--base)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold uppercase tracking-wider text-[var(--accent)] sm:text-4xl">
          GIVE US A FOLLOW
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {instagramImages.map((src, index) => (
            <Link
              key={index}
              href="https://www.instagram.com/randtspace"
              target="_blank"
              className="group relative aspect-square overflow-hidden"
            >
              <Image
                src={src}
                alt={`Instagram post ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                quality={80}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmailSubscriptionSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    // Simulate API call
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[var(--base)] px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-heading text-5xl font-bold text-[var(--accent)] sm:text-6xl md:text-7xl mb-8">
          Join the R&amp;T Creator Circle
        </h2>
        <p className="text-xl text-[var(--accent)]/80 mb-16 leading-relaxed max-w-2xl mx-auto">
          Monthly studio tips, lighting setups, workflow guidance, and member-only perks.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:flex-row max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              required
              disabled={isSubmitting}
              className={`w-full border border-[var(--accent)]/20 bg-[var(--base)] px-6 py-5 text-lg text-[var(--accent)] transition-colors focus:outline-none focus:border-[var(--accent)]/40 ${
                status === "error"
                  ? "border-red-500 focus:border-red-500"
                  : status === "success"
                  ? "border-green-500 focus:border-green-500"
                  : ""
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-invalid={status === "error"}
              aria-describedby={status === "error" ? "email-error" : undefined}
            />
            {status === "error" && (
              <p id="email-error" className="absolute -bottom-6 left-0 text-sm text-red-500 mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Joining..." : status === "success" ? "Joined!" : "Join the Circle"}
          </button>
        </form>
        {status === "success" && (
          <div className="mt-8 p-6 border border-[var(--accent)]/20 bg-[var(--base)]">
            <p className="text-lg text-[var(--accent)]">Thank you for joining. Welcome to the circle.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[var(--base)] px-4 py-20 text-sm text-[var(--accent)]/80 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--accent)]">R&amp;T Spaces</h3>
            <p className="text-base text-[var(--accent)]/80 leading-relaxed">
              London creative studio for photographers &amp; creators.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--accent)]">Quick Links</h3>
            <nav className="space-y-3">
              <Link href="/studio" className="block text-[var(--accent)]/80 hover:text-[var(--accent)] transition">
                Studios
              </Link>
              <Link href="/services" className="block text-[var(--accent)]/80 hover:text-[var(--accent)] transition">
                Pricing
              </Link>
              <Link href="/contact" className="block text-[var(--accent)]/80 hover:text-[var(--accent)] transition">
                Book Now
              </Link>
              <Link href="/contact" className="block text-[var(--accent)]/80 hover:text-[var(--accent)] transition">
                Contact
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--accent)]">Contact</h3>
            <div className="space-y-3 text-[var(--accent)]/80">
              <p>
                Unit 3E, 736-740 Romford Road<br />
                London E12 6BT
              </p>
              <p>
                <a href="mailto:Teddy77723@gmail.com" className="hover:text-[var(--accent)] transition">
                  Teddy77723@gmail.com
                </a>
              </p>
              <p>
                <a href="tel:07944667000" className="hover:text-[var(--accent)] transition">
                  07944667000
                </a>
              </p>
            </div>
          </div>

          {/* Column 4: Socials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--accent)]">Follow Us</h3>
            <div className="flex gap-4">
              <Link
                href="https://www.instagram.com/randtspace"
                className="text-[var(--accent)]/80 hover:text-[var(--accent)] transition"
                target="_blank"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link
                href="https://www.facebook.com"
                className="text-[var(--accent)]/80 hover:text-[var(--accent)] transition"
                target="_blank"
                aria-label="Facebook"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link
                href="https://www.tiktok.com/@randtspace"
                className="text-[var(--accent)]/80 hover:text-[var(--accent)] transition"
                target="_blank"
                aria-label="TikTok"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </Link>
              <Link
                href="https://www.twitter.com"
                className="text-[var(--accent)]/80 hover:text-[var(--accent)] transition"
                target="_blank"
                aria-label="Twitter"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Line */}
        <div className="pt-8 border-t border-[var(--accent)]/10 text-center">
          <p className="text-sm text-[var(--accent)]/60">
            © 2025 R&amp;T Spaces. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

