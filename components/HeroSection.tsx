"use client";

import Image from "next/image";
import Link from "next/link";
import { GradientBars } from "@/components/ui/gradient-bars";
import { useState, useEffect, useRef } from "react";

const carouselImages = [
  {
    src: "/assets/9664d1b7-9f9a-4c82-bf63-5befb91b0102(1).jpg",
    alt: "Content Creation",
    label: "Content Creation"
  },
  {
    src: "/assets/2a18f8ef-1393-4f8a-acfe-b6b8eb5a1cee.jpg",
    alt: "Photography",
    label: "Photography Sessions"
  },
  {
    src: "/assets/2c432d2e-bfd8-4632-810b-ce75af0f8287.jpg",
    alt: "Video Production",
    label: "Video Production"
  },
  {
    src: "/assets/5cd64b86-f29d-4b35-8806-162c18542a5b(1).jpg",
    alt: "Live Streaming",
    label: "Live Streaming"
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Auto-rotation effect
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // Rotate every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused]);

  const getImagePosition = (imageIndex: number) => {
    // Calculate relative position from current index
    let relativePos = imageIndex - currentIndex;
    
    // Handle wrapping for circular carousel
    if (relativePos > carouselImages.length / 2) {
      relativePos -= carouselImages.length;
    } else if (relativePos < -carouselImages.length / 2) {
      relativePos += carouselImages.length;
    }
    
    return relativePos;
  };

  return (
    <section 
      className="relative min-h-screen -mt-[73px] pt-[73px] pb-16 md:pb-20 lg:pb-24 overflow-hidden"
      style={{
        backgroundColor: 'var(--hero-background)'
      }}
    >
      {/* Gradient Bars Background */}
      <GradientBars colors={['var(--primary)', 'transparent']} />
      
      {/* Content Section - Two Column Layout */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 mb-6 md:mb-8 lg:mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Column - Main Heading */}
          <div className="text-left">
            <h1 
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-6 md:mb-8 text-[var(--primary)]"
            >
              THE STUDIO SPACE
              <br className="hidden sm:block" />
              WHERE CREATIVITY MEETS
              <br className="hidden sm:block" />
              PROFESSIONAL EXCELLENCE
            </h1>
            
            {/* Social Proof - Star Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--accent-gold)' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span 
                className="text-sm md:text-base font-light text-[var(--primary)]"
              >
                4.9/5 from 200+ creators
              </span>
            </div>
          </div>

          {/* Right Column - Description and CTAs */}
          <div className="flex flex-col justify-start">
            {/* Description */}
            <p 
              className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 lg:mb-12 leading-relaxed font-light text-left text-[var(--primary)]"
            >
              RT Spaces delivers world-class studio environments designed for creators who demand excellence. 
              Our approach combines cutting-edge equipment, versatile spaces, and unparalleled service to transform 
              your creative concepts into compelling visual stories.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
              <Link 
                href="/book-online"
                className="btn-primary group min-w-[180px]"
              >
                <span className="flex items-center gap-2">
                  Hire a Studio
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
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
                className="group min-w-[180px] inline-flex items-center justify-center border border-white bg-white px-4 py-2 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-[var(--primary)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  View Packages
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
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

      {/* 3D Carousel - Layered Images */}
      <div className="relative z-10 mb-6 md:mb-8 lg:mb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="relative h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            
            {/* Image Stack Container - all images rendered for smooth transitions */}
            <div 
              className="relative w-full max-w-4xl h-full"
            >
              {carouselImages.map((image, imageIndex) => {
                const position = getImagePosition(imageIndex);
                const isCenter = position === 0;
                const isVisible = Math.abs(position) <= 2;
                
                // Calculate transform based on position - card shuffling effect
                let transform = '';
                let zIndex = 0;
                let opacity = 0;
                
                if (position === 0) {
                  // Center - main image
                  transform = 'translateX(0) translateY(0) scale(1)';
                  zIndex = 50;
                  opacity = 1;
                } else if (position === -1) {
                  // Left 1 - subtle shuffle
                  transform = 'translateX(-60%) translateY(-8px) scale(0.85)';
                  zIndex = 40;
                  opacity = 0.75;
                } else if (position === 1) {
                  // Right 1 - subtle shuffle
                  transform = 'translateX(60%) translateY(-8px) scale(0.85)';
                  zIndex = 40;
                  opacity = 0.75;
                } else if (position === -2) {
                  // Left 2 - further back
                  transform = 'translateX(-90%) translateY(-12px) scale(0.7)';
                  zIndex = 30;
                  opacity = 0.5;
                } else if (position === 2) {
                  // Right 2 - further back
                  transform = 'translateX(90%) translateY(-12px) scale(0.7)';
                  zIndex = 30;
                  opacity = 0.5;
                } else {
                  // Off-screen - position out of view but keep in DOM for smooth transitions
                  const direction = position > 0 ? 1 : -1;
                  transform = `translateX(${direction * 120}%) translateY(-12px) scale(0.5)`;
                  zIndex = 10;
                  opacity = 0;
                }
                
                return (
                  <div
                    key={image.src}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                    style={{
                      transform: transform,
                      zIndex,
                      opacity,
                      width: '80%',
                      maxWidth: '500px',
                      height: '70%',
                      pointerEvents: isVisible ? 'auto' : 'none',
                    }}
                  >
                    <div className="relative w-full h-full bg-white shadow-2xl overflow-hidden border-8 transition-opacity duration-1000 ease-in-out" style={{ borderColor: 'white' }}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 80vw, 500px"
                        className="object-cover"
                        priority={isCenter}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-[60] bg-white/90 hover:bg-white text-[var(--primary)] p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-[60] bg-white/90 hover:bg-white text-[var(--primary)] p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
