"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import { GradientBars } from "@/components/ui/gradient-bars";
import { BookNowButton } from "@/components/booking/BookNowButton";

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

export function StudioHeroStats() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Studio images for rotation
  const rotatingImages = [
    "/assets/studios/IMG_7854.JPG",
    "/assets/studios/919177f2-e71e-4881-90d0-b0eef3b4ccfc.jpg",
    "/assets/studios/c66dafbf-5a57-4d92-bce9-67dd277a70b9.jpg",
    "/assets/home/IMG_7808.JPG",
    "/assets/equipment/f8c6e9ae-3bde-4eb0-a641-4d937ede8ef1.jpg",
    "/assets/gallery/5F978C66-0CA5-46F1-8156-3E610244CDD4.jpg",
  ];

  // Auto-rotate images every 4 seconds (paused for reduced-motion users)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % rotatingImages.length);
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
                Everything&apos;s already set up
              </h2>
            </div>
            
            {/* Right: Description */}
            <div className="flex flex-col justify-center">
              <p className="text-base sm:text-lg text-[var(--muted-plum)] leading-relaxed">
                A bright 5m × 5m space in East London with a white cyclorama, styled corners,
                professional lighting and backdrops. Built for photographers, content creators
                and brands. Turn up and shoot.
              </p>
            </div>
          </div>
        </div>

        {/* Large Hero Image with Rotation and CTA Overlay */}
        <div className="group relative aspect-[16/9] lg:aspect-[21/9] cursor-pointer">
          <div className="relative w-full h-full">
            {/* Photo Frame Effect - Purple frame */}
            <div className="relative w-full h-full bg-[var(--primary)] shadow-2xl overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--primary)' }}>
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
              <BookNowButton
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
              </BookNowButton>
              <Link
                href="/studio"
                className="group/btn whitespace-nowrap rounded-full border border-white bg-transparent text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm tracking-[0.05em]"
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
              <BookNowButton
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
              </BookNowButton>
              <Link 
                href="/studio"
                className="group/btn w-full text-center rounded-full border border-white bg-transparent text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm tracking-[0.05em]"
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

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Choose your space & package",
      description:
        "Pick studio hire by the hour or a full session package. Browse the cyclorama, styled corners and the kit that's included.",
    },
    {
      number: "02",
      title: "Book & pay your deposit",
      description:
        "Reserve your slot online in minutes. A 50% deposit secures the date; the balance is due before your session.",
    },
    {
      number: "03",
      title: "Show up & shoot",
      description:
        "Walk in to lighting configured, backdrops hung and everything prepped. All you bring is the idea.",
    },
  ];

  return (
    <section className="bg-[var(--secondary)] py-16 md:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-[var(--gold-text)] mb-4">
            How it works
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[var(--primary)]">
            Booked in three steps
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="border-t-2 border-[var(--primary)]/15 pt-6">
              <p className="font-heading text-6xl sm:text-7xl font-bold leading-none text-[var(--primary)]/15 mb-5">
                {step.number}
              </p>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--primary)] mb-3">
                {step.title}
              </h3>
              <p className="leading-relaxed text-[var(--muted-plum)]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <BookNowButton className="btn-primary">Start booking</BookNowButton>
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
            <BookNowButton
              className="rounded-full border border-white bg-transparent text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm w-full"
            >
              Reserve Your Studio Session
            </BookNowButton>
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
            <BookNowButton
              className="rounded-full border border-white bg-transparent text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 font-medium text-sm"
            >
              Reserve Your Studio Session
            </BookNowButton>
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
              {highlights.map((highlight) => (
                <div key={highlight.label} className="flex gap-4 border-t border-[var(--lavender)] pt-6">
                  <div className="flex-shrink-0 mt-1 text-[var(--gold-text)]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--primary)] mb-1">{highlight.label}</p>
                    <p className="text-sm text-[var(--muted-plum)] leading-relaxed">{highlight.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <BookNowButton offer="session" className="btn-primary inline-flex mt-6">
              Book a Session
            </BookNowButton>
          </div>

          {/* Right: Image with Photo Frame */}
          <div className="relative group">
            <div className="relative aspect-[4/3]">
              {/* Photo Frame Effect - Purple frame matching other sections */}
              <div className="relative w-full h-full bg-[var(--primary)] shadow-2xl overflow-hidden rounded-2xl border-2 transition-transform duration-500 group-hover:scale-[1.02]" style={{ borderColor: 'var(--primary)' }}>
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
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[var(--primary)] leading-tight mb-6">
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
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-plum)] mb-3">
                Ready to book?
              </p>
              <h3 className="font-heading text-3xl sm:text-4xl text-[var(--primary)] leading-tight">
                Book the studio in under a minute
              </h3>
              <p className="text-base sm:text-lg text-[var(--muted-plum)] mt-4 leading-relaxed">
                Choose studio hire or a photo session, pick a time, and pay your
                deposit. We confirm everything by email. Prefer to chat first? Call
                or message us.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <BookNowButton className="btn-primary">
                  Check availability &amp; book
                </BookNowButton>
                <a href="mailto:enquires@rtspaces.co.uk" className="btn-secondary text-center">
                  Email us
                </a>
              </div>
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
                      <p className="text-base sm:text-lg font-medium text-[var(--primary)] group-hover:text-[var(--gold-text)] transition-colors normal-case break-words">
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
                Unit 3E, Room 1, 736-740 Romford Road
              </p>
              <p className="text-base sm:text-lg font-semibold text-[var(--primary)] mb-3">
                London E12 6BT
              </p>
              <p className="text-sm text-[var(--muted-plum)] mb-4 leading-relaxed">
                On-site parking available after 6 PM · Stratford station 12 mins by bus
              </p>
              
              {/* Google Maps Embed - exact location from Share > Embed a map */}
              <div className="relative w-full h-56 sm:h-64 overflow-hidden border-2 border-[var(--primary)]/30 mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!3m2!1sen!2suk!4v1772292757644!5m2!1sen!2suk!6m8!1m7!1s1DIvLbkU8cPBvGYgfTa3Dw!2m2!1d51.55246883464158!2d0.05409363759610242!3f331.4546931235256!4f-2.861728092477705!5f0.7820865974627469"
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
                href="https://maps.app.goo.gl/eWBKrpy5enGPKmEG7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--gold-text)] transition-colors group"
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

export function StudioFeaturesSection() {
  const features = [
    {
      label: "Pro lighting",
      detail: "Softboxes, continuous LEDs, strobes, diffusers and reflectors, all prepped and ready before your call time.",
    },
    {
      label: "Backdrops & sets",
      detail: "A seamless white cyclorama, textured walls, colour paper rolls and styled lifestyle corners, hung and ready to shoot.",
    },
    {
      label: "Shoot-ready extras",
      detail: "A vanity and changing area, refreshments, and on-site parking after 6pm. Open daily, 8am to 11pm.",
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
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
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
              <div className="relative w-full h-full bg-[var(--primary)] shadow-2xl overflow-hidden rounded-2xl border-2" style={{ borderColor: 'var(--primary)' }}>
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
              <BookNowButton
                className="btn-primary w-full text-center"
                style={{
                  boxShadow: '0 4px 16px rgba(61, 35, 80, 0.2), 0 2px 8px rgba(61, 35, 80, 0.1)',
                }}
              >
                Book Now
              </BookNowButton>
              <Link
                href="/#contact"
                className="btn-secondary w-full text-center"
                style={{
                  boxShadow: '0 2px 12px rgba(61, 35, 80, 0.12), 0 1px 4px rgba(61, 35, 80, 0.08)',
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

export function EmailSubscriptionSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Subscription failed");
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
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--primary)] mb-8">
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
              className={`w-full rounded-xl border border-white/30 bg-white/95 backdrop-blur-sm px-6 py-5 text-lg text-[var(--primary)] placeholder:text-[var(--primary)]/70 transition-colors focus:outline-none focus:border-white focus:bg-white ${
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
          <div className="mt-8 rounded-xl p-6 border border-white/30 bg-white/95 backdrop-blur-sm">
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
                <Link href="/members" className="block text-white/80 hover:text-white transition">
                  Members
                </Link>
                <BookNowButton className="block text-left text-white/80 hover:text-white transition">
                  Book Online
                </BookNowButton>
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
                  Unit 3E, Room 1, 736-740 Romford Road<br />
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
            <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href="/terms"
                className="text-[var(--muted-plum)] hover:text-[var(--primary)] transition"
              >
                Terms &amp; Conditions
              </Link>
            </div>
            <p className="text-sm text-[var(--muted-plum)]">
              © 2025 RT Spaces. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
