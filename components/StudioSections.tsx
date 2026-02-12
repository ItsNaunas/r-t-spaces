"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { Lightbox } from "@/components/Lightbox";
import { GradientBars } from "@/components/ui/gradient-bars";
import { BookingForm } from "@/components/BookingForm";
import { studioGallery, studioServices } from "@/lib/studioData";

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

export { studioGallery, studioServices };

export function StorySection() {
  return (
    <section className="bg-white px-2 py-12 sm:px-4 lg:px-0">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
            About RT Spaces
          </p>
          <h2 className="font-heading text-5xl sm:text-6xl leading-tight text-[var(--primary)] lg:text-7xl">
            A home for creators, brand launches, and portrait sessions in East
            London.
          </h2>
          <p className="text-lg text-[var(--muted-plum)]">
            Founded by Rose &amp; Teddy, RT Spaces pairs a calming studio
            with ready-to-roll equipment so you can focus on directing talent,
            shooting content, or hosting clients.
          </p>
        </div>
        <div className="grid gap-6">
          {valueList.map((value, index) => (
            <div
              key={value.label}
              className="flex gap-5 border-t border-[var(--lavender)] pt-6"
            >
              <div className="text-sm font-semibold text-[var(--muted-plum)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <p className="font-semibold text-[var(--primary)]">{value.label}</p>
                <p className="text-sm text-[var(--muted-plum)]">{value.detail}</p>
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
    <section className="grid gap-10 bg-white px-2 py-12 sm:px-4 lg:grid-cols-2 lg:px-0">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
          Translate your vision
        </p>
        <h3 className="font-heading text-4xl text-[var(--primary)]">
          Pick the service that fits your shoot day.
        </h3>
        <p className="text-lg text-[var(--muted-plum)]">
          Whether you need four walls and great light or prefer our crew to jump
          in, we tailor bookings to your run sheet and deliverables.
        </p>
          <Link
            href="/#contact"
            className="btn-cta btn-small"
          >
            Book Now
          </Link>
      </div>
      <div className="space-y-6">
        <div className="overflow-hidden bg-white  shadow-lg">
          <Image
            src="/assets/studios/09221174-0c46-4aa0-92c0-ee51b9af5ca4.jpg"
            alt="Creative direction"
            width={800}
            height={600}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-[360px] w-full object-cover sm:h-[420px] "
            loading="lazy"
            quality={85}
          />
        </div>
        <div className="border border-[var(--lavender)] p-6 bg-white  shadow-lg">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
            Our services
          </p>
          <div className="mt-6 space-y-5">
            {studioServices.map((service) => (
              <div key={service.title} className="border-t border-[var(--lavender)] pt-4">
                <p className="font-semibold text-[var(--primary)]">{service.title}</p>
                <p className="text-sm text-[var(--muted-plum)]">{service.meta}</p>
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
    <section className="bg-white px-2 py-12 sm:px-4 lg:px-0">
      <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
        See our work
      </p>
      <h3 className="mt-4 font-heading text-4xl text-[var(--primary)] lg:text-5xl">
        Glimpses from the studio floor.
      </h3>

      <div className="mt-10 overflow-hidden bg-white  shadow-lg">
        <Image
          src="/assets/gallery/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg"
          alt="Featured project"
          width={1400}
          height={800}
          sizes="(max-width: 768px) 100vw, 100vw"
          className="h-[320px] w-full object-cover sm:h-[420px] "
          priority
          quality={85}
        />
      </div>

      <div className="mt-8 grid gap-6 border-t border-[var(--lavender)] pt-8 text-sm text-[var(--muted-plum)] lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-plum)]">
            Featured Session
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--primary)]">
            InTheSpotlight Content Day
          </p>
        </div>
        <p className="lg:col-span-2">
          Tethered capture, seamless wardrobe changes, and styled corners that
          keep creators comfortable while delivering polished imagery.
        </p>
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold text-[var(--primary)]">Location:</span> Unit 3E,
            736-740 Romford Road, London
          </p>
          <p>
            <span className="font-semibold text-[var(--primary)]">Hours:</span> Open daily
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
      <section className="bg-white px-2 py-12 sm:px-4 lg:px-0">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-3xl text-[var(--primary)]">Studio Archive</h3>
          <Link
            href="https://www.instagram.com/rtspaces/"
            className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors"
            target="_blank"
          >
            Follow @rtspaces →
          </Link>
        </div>
        <div 
          ref={ref}
          className={`mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {studioGallery.map((item, index) => (
            <div
              key={item.artist}
              className="group"
            >
              {/* Photo Frame Effect - Image inside frame */}
              <div 
                className="relative w-full cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <div className="relative w-full h-full bg-white shadow-2xl overflow-hidden border-8" style={{ borderColor: 'white' }}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.artist}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      quality={85}
                    />
                    {/* Hover overlay */}
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
              </div>
            </div>
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
    <section className="grid gap-6 bg-[var(--primary)] px-6 py-12 text-white sm:px-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <p className="text-sm uppercase tracking-[0.5em] text-white/80">
          Ready when you are
        </p>
        <h3 className="mt-4 font-heading text-4xl text-white">
          Book RT Spaces for your <span className="text-[var(--accent-gold)]">next</span> shoot
        </h3>
      </div>
      <div className="flex items-center justify-end">
        <Link
          href="/#contact"
          className="btn-cta"
        >
          Message us
        </Link>
      </div>
    </section>
  );
}

// Studio preview videos for marquee (reserved for future use)
// const studioPreviewVideos = [
//   "/assets/20251028_131356.mp4",
//   "/assets/20251028_131503.mp4",
//   "/assets/20251028_131543.mp4",
//   "/assets/20251028_131640.mp4",
//   "/assets/20251028_131713.mp4",
//   "/assets/20251028_131741.mp4",
//   "/assets/20251028_131808.mp4",
//   "/assets/20251028_132117.mp4",
//   "/assets/20251028_132128.mp4",
//   "/assets/20251028_132143.mp4",
//   "/assets/20251028_132355.mp4",
//   "/assets/20251028_132407.mp4",
//   "/assets/20251028_132419.mp4",
//   "/assets/20251028_143237.mp4",
// ];

// Video carousel images
const videoCarouselImages = [
  "/assets/1d5ab5d7-44b6-4a18-b709-56dffe7a2eab.mp4",
  "/assets/23c0c110-d369-4ae8-bd28-c9e6b78e5fa1.mp4",
  "/assets/3786f80c-4258-4e64-9e88-c92da28fe942.mp4",
  "/assets/42239ee3-caac-4b9b-9702-825000004018.mp4",
];

// Instagram images for social proof
const instagramImages = [
  "/assets/gallery/5F978C66-0CA5-46F1-8156-3E610244CDD4.jpg",
  "/assets/gallery/0597e892-11ea-4d66-858d-c956f9f6fc6e.jpg",
  "/assets/gallery/09221174-0c46-4aa0-92c0-ee51b9af5ca4.jpg",
  "/assets/gallery/B152F374-AA91-4F11-B52F-FB6F0907342C.jpg",
  "/assets/gallery/IMG_7809.JPG",
  "/assets/gallery/AED2EF36-E44C-48A6-B44C-5E30E05B3815.jpg",
  "/assets/gallery/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg",
  "/assets/gallery/IMG_7854.JPG",
  "/assets/gallery/IMG_7860.JPG",
  "/assets/gallery/6504BBB4-A551-4117-9E3D-FA7E74837027.jpg",
];

export function StudioHeroStats() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const stats = [
    { value: "5m × 5m", label: "Studio", sublabel: "Floor space" },
    { value: "500+", label: "Creators", sublabel: "Served" },
    { value: "4.9/5", label: "Average", sublabel: "Rating" },
    { value: "50+", label: "Bookings", sublabel: "This Month" },
    { value: "24/7", label: "Support", sublabel: "Available" },
    { value: "100%", label: "Equipment", sublabel: "Included" },
  ];

  // Studio images for rotation
  const rotatingImages = [
    "/assets/studios/IMG_7854.JPG",
    "/assets/studios/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg",
    "/assets/studios/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg",
    "/assets/home/IMG_7808.JPG",
    "/assets/equipment/f8c6e9ae-3bde-4eb0-a641-4d937ede8ef1.jpg",
    "/assets/gallery/5F978C66-0CA5-46F1-8156-3E610244CDD4.jpg",
  ];

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % rotatingImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [rotatingImages.length]);

  return (
    <section 
      className="bg-white py-12 sm:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 items-start">
            {/* Left: Title */}
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--primary)] leading-tight mb-4">
                Professional Studio Spaces For Every Creative Vision
              </h2>
            </div>
            
            {/* Right: Description */}
            <div className="flex flex-col justify-center">
              <p className="text-base sm:text-lg text-[var(--muted-plum)] leading-relaxed">
                Discover our East London studio spaces, designed for photographers, content creators, and brands. 
                From seamless white cycloramas to styled lifestyle corners, every space comes fully equipped with 
                professional lighting, backdrops, and amenities—ready for your next shoot.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 lg:mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center border-t-2 border-[var(--lavender)] pt-4"
              >
                <p className="font-heading text-3xl sm:text-4xl font-bold text-[var(--accent-gold)] mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm uppercase tracking-wider text-[var(--muted-plum)] font-medium">
                  {stat.label}
                </p>
                <p className="text-xs sm:text-sm text-[var(--muted-plum)]">
                  {stat.sublabel}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Large Hero Image with Rotation and CTA Overlay */}
        <div className="group relative aspect-[16/9] lg:aspect-[21/9] cursor-pointer">
          <div className="relative w-full h-full">
            {/* Photo Frame Effect - Purple frame */}
            <div className="relative w-full h-full bg-[var(--primary)] shadow-2xl overflow-hidden border-8" style={{ borderColor: 'var(--primary)' }}>
              {rotatingImages.map((src, index) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`RT Spaces Studio ${index + 1} - Professional content creation environment`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={index === 0}
                    quality={90}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Overlay with CTAs - Visible on mobile, enhanced on hover */}
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/0 md:bg-black/0 md:group-hover:bg-black/40 transition-all duration-500">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 sm:px-6 opacity-0 md:opacity-0 md:group-hover:opacity-100 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500">
              <Link 
                href="/#contact"
                className="btn-primary group/btn whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex items-center gap-2">
                  Book Studio
                  <svg 
                    className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link 
                href="/studio"
                className="group/btn whitespace-nowrap bg-[var(--accent-gold)] backdrop-blur-sm border-2 border-[var(--accent-gold)] text-[var(--primary)] hover:bg-[var(--gold-hover)] hover:border-[var(--gold-hover)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4  font-medium text-sm tracking-[0.05em]"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex items-center gap-2">
                  View Studio
                  <svg 
                    className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
          
          {/* Mobile: Subtle bottom overlay with CTA - Always visible on mobile */}
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-4 sm:p-6 md:hidden">
            <div className="flex flex-col gap-3">
              <Link 
                href="/#contact"
                className="btn-primary group/btn w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex items-center justify-center gap-2">
                  Book Studio
                  <svg 
                    className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link 
                href="/studio"
                className="group/btn w-full text-center bg-[var(--accent-gold)] border-2 border-[var(--accent-gold)] text-[var(--primary)] hover:bg-[var(--gold-hover)] hover:border-[var(--gold-hover)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4  font-medium text-sm tracking-[0.05em]"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="flex items-center justify-center gap-2">
                  View Studio
                  <svg 
                    className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideoCarouselSection() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
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
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 bg-white border border-[var(--lavender)] p-8 lg:p-12 shadow-lg ">
          <p className="font-heading text-3xl font-bold text-[var(--primary)] sm:text-4xl">
            Ready to create? Book your 2025 studio time now.
          </p>
          <p className="text-lg text-[var(--muted-plum)]">
            Our East London studio is ready for content days, lookbooks, and brand launches. Flexible hourly and daily rates available—book your slot today.
          </p>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-[var(--primary)] font-bold text-xl">{feature.icon}</span>
                <span className="text-[var(--muted-plum)]">{feature.text}</span>
              </div>
            ))}
          </div>
          <Link
            href="/#contact"
            className="btn-cta inline-flex"
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
              <div key={index} className="text-center p-6 bg-white border-2 border-[var(--lavender)]  shadow-lg">
                <p className="font-heading text-3xl font-bold text-[var(--primary)] mb-2">{stat.value}</p>
                <p className="text-sm text-[var(--muted-plum)] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="relative aspect-video overflow-hidden ">
            <Image
              src="/assets/gallery/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg"
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
      description: "Browse our range of fully-equipped spaces. From seamless white cyclorama to cozy lounge corners—find the perfect space that matches your needs.",
      image: "/assets/gallery/IMG_7854.JPG",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Arrive & Get Started",
      description: "Walk in and begin your session. Our team greets you with everything prepped—professional lighting configured, stands positioned, and refreshments ready. Everything is set up for you.",
      image: "/assets/gallery/IMG_7809.JPG",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Join the Community",
      description: "Become part of our growing community. Enjoy monthly studio access at member rates, plus weekly newsletters with exclusive discounts and updates.",
      image: "/assets/gallery/IMG_7810.JPG",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="pb-16 sm:pb-24 lg:pb-32">
      {/* Full Width Banner */}
      <div 
        ref={ref}
        className={`mb-16 sm:mb-20 lg:mb-24 text-center transition-all duration-700 bg-[var(--primary)] w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium uppercase tracking-wider text-white/80 mb-6">
            HOW IT WORKS
          </p>
          <h2 className="font-heading text-5xl font-bold text-white sm:text-6xl md:text-7xl">
            Book your studio space in three simple steps
          </h2>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-20 md:space-y-28 lg:space-y-36">
          {steps.map((step, index) => {
            const StepCard = ({ step, index }: { step: typeof steps[0], index: number }) => {
              const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
              // Alternating layout: Step 1 (index 0) = text left, image right
              //                    Step 2 (index 1) = image left, text right
              //                    Step 3 (index 2) = text left, image right
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  ref={ref}
                  className={`grid gap-8 md:gap-12 lg:gap-16 md:grid-cols-2 items-center transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                  }`}
                  style={{ 
                    transitionDelay: `${index * 200}ms`
                  }}
                >
                  {/* Text Content - Left for even steps, Right for odd steps */}
                  <div className={`space-y-6 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                    <div className="space-y-4">
                      <h3 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-[var(--primary)] leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-lg sm:text-xl text-[var(--muted-plum)] leading-relaxed max-w-xl">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Image Content - Right for even steps, Left for odd steps */}
                  <div className={`relative ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    {/* Photo Frame Effect - White frame */}
                    <div className="relative w-full bg-white shadow-2xl overflow-hidden border-8" style={{ borderColor: 'white' }}>
                      <div className="relative aspect-[16/10] overflow-hidden group">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          quality={85}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            };
            return <StepCard key={step.number} step={step} index={index} />;
          })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

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
      quote: "RT Spaces transformed our brand shoot. The lighting setup was flawless, and the team's attention to detail made all the difference.",
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
          className={`h-4 w-4 ${i < rating ? 'text-[var(--accent-gold)] fill-current' : 'text-white/20'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <div className="bg-white p-6 sm:p-8 shadow-[0_8px_32px_rgba(61,35,80,0.15)] flex-shrink-0 w-full lg:w-[450px]">
      {/* Avatar and Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative h-12 w-12 overflow-hidden flex-shrink-0 ring-2 ring-[var(--primary)]/30">
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
          <p className="font-semibold text-base text-[var(--primary)] truncate">
            {testimonial.author}
          </p>
          <p className="text-sm text-[var(--muted-plum)] truncate">
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-5">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Quote */}
      <p className="font-heading text-lg sm:text-xl text-[var(--primary)] mb-6 leading-relaxed">
        &quot;{testimonial.quote}&quot;
      </p>

      {/* Date */}
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-plum)]">
        {testimonial.date}
      </p>
    </div>
  );

  return (
    <section className="bg-[var(--primary)] px-4 py-16 sm:py-24 lg:py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:items-center">
          {/* Left Column: Editorial Content - Desktop only */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <p className="text-sm uppercase tracking-[0.4em] text-white/80">
              Community Voices
            </p>
            <h2 className="font-heading text-4xl leading-tight text-white lg:text-5xl">
              What creators are saying about RT Spaces
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              From portrait sessions to brand launches, our community of photographers and creators share their experiences working in our East London studio.
            </p>
            <Link
              href="/#contact"
              className="bg-white text-[var(--primary)] hover:bg-white/90 border-2 border-white px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm tracking-[0.05em] transition-all duration-300 inline-flex items-center justify-center w-full shadow-lg hover:shadow-xl"
            >
              Reserve Your Studio Session
            </Link>
          </div>

          {/* Mobile Header - Shown only on mobile */}
          <div className="lg:hidden mb-8">
            <p className="text-sm uppercase tracking-[0.4em] text-white/80 mb-4">
              Community Voices
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl leading-tight text-white mb-4">
              What creators are saying about RT Spaces
            </h2>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              From portrait sessions to brand launches, our community of photographers and creators share their experiences working in our East London studio.
            </p>
          </div>

          {/* Right Column: Horizontal Marquee - Desktop | Manual Carousel - Mobile */}
          <div className="relative overflow-hidden lg:min-h-[500px]">
            {/* Desktop: Auto-scrolling Marquee */}
            <div className="hidden lg:block relative">
              {/* Gradient Overlays */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--primary)] to-transparent z-10"></div>
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--primary)] to-transparent z-10"></div>
              
              {/* Marquee Container */}
              <div 
                className="flex gap-6 animate-marquee-fast hover-scroll-pause" 
                style={{ width: 'max-content' }}
              >
                {duplicatedTestimonials.map((testimonial, index) => (
                  <TestimonialCard key={`testimonial-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Mobile: Manual Carousel with Navigation */}
            <div className="lg:hidden relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ 
                    transform: `translateX(-${currentIndex * 100}%)`
                  }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={`mobile-testimonial-${index}`} className="flex-shrink-0 w-full px-2">
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 flex items-center justify-center"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/40 w-2 hover:bg-white/60'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 flex items-center justify-center"
                  aria-label="Next testimonial"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile CTA Button - Shown only on mobile */}
          <div className="lg:hidden mt-8 text-center">
            <Link
              href="/#contact"
              className="bg-white text-[var(--primary)] hover:bg-white/90 border-2 border-white px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm tracking-[0.05em] transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Reserve Your Studio Session
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutUsSection() {
  const { ref, isVisible } = useScrollAnimation();

  const highlights = [
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
  ];

  return (
    <section 
      ref={ref}
      className={`py-16 md:py-24 lg:py-32 bg-white transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                About Us
              </p>
              <h2 className="font-heading text-4xl leading-tight text-[var(--primary)] lg:text-5xl">
                A home for creators, brand launches, and portrait sessions in East London.
              </h2>
              <p className="text-lg text-[var(--muted-plum)] leading-relaxed">
                Founded by Rose &amp; Teddy, RT Spaces pairs a calming studio
                with ready-to-roll equipment so you can focus on directing talent,
                shooting content, or hosting clients.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="space-y-4 pt-4">
              {highlights.map((highlight, index) => (
                <div key={highlight.label} className="flex gap-5 border-t border-[var(--lavender)] pt-6">
                  <div className="text-sm font-semibold text-[var(--muted-plum)] flex-shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--primary)] mb-1">{highlight.label}</p>
                    <p className="text-sm text-[var(--muted-plum)] leading-relaxed">{highlight.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/#contact"
              className="btn-primary inline-flex mt-6"
            >
              Book a Session
            </Link>
          </div>

          {/* Right: Image with Photo Frame */}
          <div className="relative group">
            <div className="relative aspect-[4/3]">
              {/* Photo Frame Effect - Purple frame matching other sections */}
              <div className="relative w-full h-full bg-[var(--primary)] shadow-2xl overflow-hidden border-8 transition-transform duration-500 group-hover:scale-[1.02]" style={{ borderColor: 'var(--primary)' }}>
                <Image
                  src="/assets/studios/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg"
                  alt="RT Spaces studio - creative workspace"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  quality={85}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation();

  const contactDetails = [
    { 
      label: "Email", 
      value: "enquires@rtspaces.co.uk",
      href: "mailto:enquires@rtspaces.co.uk",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    { 
      label: "Instagram", 
      value: "@rtspaces",
      href: "https://www.instagram.com/rtspaces/",
      external: true,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    { 
      label: "Phone", 
      value: "07944667000",
      href: "tel:07944667000",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ];

  const openingHours = [
    { day: "Monday - Sunday", hours: "8 AM – 11 PM" },
  ];

  return (
    <section id="contact" className="relative py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`mb-12 sm:mb-16 transition-all duration-700 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-4">
            Contact
          </p>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-[var(--primary)] leading-tight mb-6">
            Get In Touch
          </h2>
          <p className="text-lg sm:text-xl text-[var(--muted-plum)] leading-relaxed max-w-3xl">
            Have questions? Want to book a session? Send us a message or reach
            out directly. We&apos;re here to help make your creative vision a
            reality.
          </p>
        </div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Left Column - Contact Form */}
          <div 
            ref={formRef}
            className={`transition-all duration-700 delay-100 ${
              formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="bg-white p-6 sm:p-8 lg:p-10 shadow-lg border-2 border-[var(--primary)]/40">
              <div className="mb-6 sm:mb-8">
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-3">
                  Send Us a Message
                </p>
                <h3 className="font-heading text-3xl sm:text-4xl text-[var(--primary)] leading-tight">
                  Let&apos;s Start a Conversation
                </h3>
                <p className="text-base sm:text-lg text-[var(--muted-plum)] mt-4 leading-relaxed">
                  Fill out the form below and we&apos;ll get back to you as soon as possible. 
                  For urgent enquiries, give us a call.
                </p>
              </div>
              
                <Suspense
                fallback={
                  <div className="flex h-64 items-center justify-center border-2 border-[var(--primary)]/30 p-6 text-sm text-[var(--muted-plum)]">
                    Loading form…
                  </div>
                }
              >
                <BookingForm />
              </Suspense>
            </div>
          </div>

          {/* Right Column - Contact Information */}
          <div 
            ref={infoRef}
            className={`space-y-6 transition-all duration-700 delay-200 ${
              infoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Contact Details Cards */}
            <div className="space-y-4">
              {contactDetails.map((detail) => (
                <a
                  key={detail.label}
                  href={detail.href}
                  target={detail.external ? "_blank" : undefined}
                  rel={detail.external ? "noopener noreferrer" : undefined}
                  className="group block bg-white p-5 sm:p-6 border-2 border-[var(--primary)]/40 hover:border-[var(--primary)]/70 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-300">
                      {detail.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-1.5">
                        {detail.label}
                      </p>
                      <p className="text-base sm:text-lg font-medium text-[var(--primary)] group-hover:text-[var(--accent-gold)] transition-colors normal-case break-words">
                        {detail.value}
                      </p>
                    </div>
                    <svg 
                      className="w-5 h-5 text-[var(--muted-plum)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0 mt-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            {/* Opening Hours Card */}
            <div className="bg-white p-6 sm:p-7 border-2 border-[var(--primary)]/40">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                  Opening Hours
                </p>
              </div>
              <div className="space-y-3">
                {openingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center pb-3 border-b border-[var(--primary)]/20 last:border-0">
                    <span className="text-base sm:text-lg text-[var(--primary)] font-semibold">
                      {schedule.day}
                    </span>
                    <span className="text-base sm:text-lg text-[var(--muted-plum)]">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--muted-plum)] mt-5 italic">
                Extended hours available upon request
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white p-6 sm:p-7 border-2 border-[var(--primary)]/40">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)]">
                  Visit Us
                </p>
              </div>
              <p className="text-base sm:text-lg font-semibold text-[var(--primary)] mb-2">
                Unit 3E, 736-740 Romford Road
              </p>
              <p className="text-base sm:text-lg font-semibold text-[var(--primary)] mb-3">
                London E12 6BT
              </p>
              <p className="text-sm text-[var(--muted-plum)] mb-4 leading-relaxed">
                On-site parking available after 6 PM · Stratford station 12 mins by bus
              </p>
              
              {/* Google Maps Embed */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden border-2 border-[var(--primary)]/30 mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.1234567890!2d0.0436!3d51.5494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMyJzU3LjgiTiAwwrAwMiczNy4wIkU!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RT Spaces Location"
                  className="absolute inset-0"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Unit+3E,+736-740+Romford+Road,+London+E12+6BT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--accent-gold)] transition-colors group"
              >
                Open in Google Maps
                <svg 
                  className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LatestNewsSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-5xl font-bold text-[var(--primary)] sm:text-6xl md:text-7xl">
          Latest News
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden bg-white  shadow-lg">
            <Image
              src="/assets/gallery/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg"
              alt="New studio room"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover "
              loading="lazy"
              quality={85}
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="px-3 py-1 bg-[var(--primary)] text-white text-xs font-semibold uppercase tracking-wider ">
                NEW STUDIO
              </span>
              <time className="text-sm text-[var(--muted-plum)]" dateTime="2024-12-01">
                December 2024
              </time>
            </div>
            <h3 className="font-heading text-3xl font-bold text-[var(--primary)] sm:text-4xl">
              We have officially launched Unit 3E Studio
            </h3>
            <p className="text-lg text-[var(--muted-plum)]">
              Our newest studio space in East London features a seamless white cyclorama, textured concrete walls, and a cozy lounge corner. Equipped with professional lighting, continuous LEDs, and all the amenities you need for a successful shoot day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/#contact"
                className="btn-cta w-fit"
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
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-2">
            Join the community
          </p>
          <h2 className="font-heading text-3xl font-bold text-[var(--primary)] sm:text-4xl">
            Join 500+ creators who&apos;ve chosen RT Spaces
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
    <div className="text-center p-8 bg-white  border-2 border-[var(--lavender)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg">
      <p className="font-heading text-5xl font-bold text-[var(--primary)] mb-2">
        {count}{stat.suffix}
      </p>
      <p className="text-lg text-[var(--muted-plum)] uppercase tracking-wider">{stat.label}</p>
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
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--muted-plum)] mb-2">
            Why Choose Us
          </p>
          <h2 className="font-heading text-4xl font-bold text-[var(--primary)] sm:text-5xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-plum)] max-w-2xl mx-auto">
            Professional spaces designed for seamless content creation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4 p-6 bg-white border-2 border-[var(--lavender)]  hover:border-[var(--primary)] transition-colors shadow-lg">
              <div className="flex justify-center">
                <div className="p-4 bg-[var(--primary)]/10 text-[var(--primary)] ">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-[var(--primary)]">{feature.title}</h3>
              <p className="text-[var(--muted-plum)] text-sm">{feature.description}</p>
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
      label: "Pro Lighting",
      detail: "High-end softboxes, continuous LEDs, diffusers, reflectors, strobes and modifiers — all equipment prepped and ready before call time.",
    },
    {
      label: "Multiple Backdrops",
      detail: "Seamless white cyclorama, textured grey walls, curated colour rolls, and lifestyle setups — professionally hung and ready to use.",
    },
    {
      label: "Performance Insights",
      detail: "Visualize your shoot progress with real-time tethering, instant previews, and immediate client feedback loops for better creative decisions.",
    },
  ];

  return (
    <section 
      className="pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-24 lg:pb-32 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Block - Left Aligned */}
        <div className="mb-12 md:mb-16">
          <p className="text-sm uppercase tracking-wider mb-3 text-[var(--muted-plum)]">
            • Everything You Need
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="text-[var(--primary)]">What&apos;s Included in Your </span>
            <span className="font-heading text-[var(--primary)]">Session</span>
          </h2>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Large Editorial Image with Card Style */}
          <div className="relative">
            <div 
              className="relative aspect-[4/3] "
            >
              {/* Photo Frame Effect - Purple frame */}
              <div className="relative w-full h-full bg-[var(--primary)] shadow-2xl overflow-hidden border-8" style={{ borderColor: 'var(--primary)' }}>
                <Image
                  src="/assets/equipment/13bad677-2b14-47e9-9797-3bd7cd6b030a.jpg"
                  alt="Professional studio setup with lighting equipment"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                  quality={90}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Numbered List with Larger Text */}
          <div className="flex flex-col">
            <div className="grid gap-12 mb-8">
              {features.map((feature, index) => (
                <div
                  key={feature.label}
                  className="flex gap-6 border-t border-[var(--lavender)] pt-12"
                >
                  <div className="text-base font-semibold text-[var(--muted-plum)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[var(--primary)] mb-2">{feature.label}</p>
                    <p className="text-base text-[var(--muted-plum)] leading-relaxed">{feature.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* CTAs */}
            <div className="flex flex-col gap-4 mt-4">
              <Link 
                href="/#contact" 
                className="btn-primary w-full text-center"
                style={{
                  boxShadow: '0 4px 16px rgba(61, 35, 80, 0.2), 0 2px 8px rgba(61, 35, 80, 0.1)',
                  borderRadius: '0'
                }}
              >
                Book Now
              </Link>
              <Link 
                href="/#contact" 
                className="btn-secondary w-full text-center"
                style={{
                  boxShadow: '0 2px 12px rgba(61, 35, 80, 0.12), 0 1px 4px rgba(61, 35, 80, 0.08)',
                  borderRadius: '0'
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GiveUsAFollowSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-heading text-center text-3xl font-bold uppercase tracking-wider text-[var(--primary)] sm:text-4xl">
          GIVE US A FOLLOW
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {instagramImages.map((src, index) => (
            <Link
              key={index}
              href="https://www.instagram.com/rtspaces/"
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
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      className="relative px-4 py-16 sm:py-24 lg:py-32 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: 'var(--hero-background)' }}
    >
      {/* Gradient Bars Background */}
      <GradientBars colors={['var(--primary)', 'transparent']} />
      
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="text-5xl font-normal text-[var(--primary)] sm:text-6xl md:text-7xl mb-8">
          Join the <span className="font-heading">R&amp;T</span> Creator Circle
        </h2>
        <p className="text-xl text-[var(--primary)] mb-16 leading-relaxed max-w-2xl mx-auto">
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
              className={`w-full border border-white/30 bg-white/95 backdrop-blur-sm px-6 py-5 text-lg text-[var(--primary)] placeholder:text-[var(--primary)]/70 transition-colors focus:outline-none focus:border-white focus:bg-white ${
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
          <div className="mt-8 p-6 border border-white/30 bg-white/95 backdrop-blur-sm">
            <p className="text-lg text-[var(--primary)]">Thank you for joining. Welcome to the circle.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer>
      {/* Top strip - deep plum */}
      <div className="bg-[var(--primary)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">RT Spaces</h3>
              <p className="text-base text-white/80 leading-relaxed">
                London creative studio for photographers &amp; creators.
              </p>
            </div>

            {/* Column 2: Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <nav className="space-y-3">
                <Link href="/studio" className="block text-white/80 hover:text-white transition">
                  Studios
                </Link>
                <Link href="/equipment" className="block text-white/80 hover:text-white transition">
                  Equipment & Backdrops
                </Link>
                <Link href="/services" className="block text-white/80 hover:text-white transition">
                  Packages / Pricing
                </Link>
                <Link href="/#contact" className="block text-white/80 hover:text-white transition">
                  Book Online
                </Link>
                <Link href="/gallery" className="block text-white/80 hover:text-white transition">
                  Our Work / Gallery
                </Link>
                <Link href="/#contact" className="block text-white/80 hover:text-white transition">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Column 3: Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact</h3>
              <div className="space-y-3 text-white/80">
                <p>
                  Unit 3E, 736-740 Romford Road<br />
                  London E12 6BT
                </p>
                <p>
                  <a href="mailto:enquires@rtspaces.co.uk" className="hover:text-white transition">
                    enquires@rtspaces.co.uk
                  </a>
                </p>
                <p>
                  <a href="tel:07944667000" className="hover:text-white transition">
                    07944667000
                  </a>
                </p>
              </div>
            </div>

            {/* Column 4: Socials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Follow Us</h3>
              <div className="flex gap-4">
                <Link
                  href="https://www.instagram.com/rtspaces/"
                  className="text-white/80 hover:text-white transition"
                  target="_blank"
                  aria-label="Instagram"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
                <Link
                  href="https://www.facebook.com"
                  className="text-white/80 hover:text-white transition"
                  target="_blank"
                  aria-label="Facebook"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <Link
                  href="https://www.tiktok.com/@rtspaces"
                  className="text-white/80 hover:text-white transition"
                  target="_blank"
                  aria-label="TikTok"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </Link>
                <Link
                  href="https://www.twitter.com"
                  className="text-white/80 hover:text-white transition"
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
        </div>
      </div>

      {/* Lower footer */}
      <div className="px-4 py-8 text-sm text-[var(--muted-plum)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="pt-8 border-t border-[var(--lavender)] text-center">
            <p className="text-sm text-[var(--muted-plum)]">
              © 2025 RT Spaces. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

