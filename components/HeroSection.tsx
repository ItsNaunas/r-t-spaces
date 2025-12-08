"use client";

import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section 
      className="relative min-h-screen -mt-[73px] pt-[73px] pb-16 md:pb-20 lg:pb-24"
      style={{ backgroundColor: 'var(--base)' }}
    >
      {/* Top Image Grid - 4 Images with matching padding */}
      <div className="pt-12 md:pt-16 lg:pt-20 mb-12 md:mb-16 lg:mb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
            {/* Image 1 */}
            <div 
              className="relative aspect-square overflow-hidden rounded-sm group"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Image
                src="/assets/9664d1b7-9f9a-4c82-bf63-5befb91b0102(1).jpg"
                alt="Content Creation"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs uppercase tracking-wider font-light">Content</p>
                <p className="text-xs uppercase tracking-wider font-light">Creation</p>
              </div>
            </div>

            {/* Image 2 */}
            <div 
              className="relative aspect-square overflow-hidden rounded-sm group"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Image
                src="/assets/2a18f8ef-1393-4f8a-acfe-b6b8eb5a1cee.jpg"
                alt="Photography"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs uppercase tracking-wider font-light">Photography</p>
                <p className="text-xs uppercase tracking-wider font-light">Sessions</p>
              </div>
            </div>

            {/* Image 3 */}
            <div 
              className="relative aspect-square overflow-hidden rounded-sm group"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Image
                src="/assets/2c432d2e-bfd8-4632-810b-ce75af0f8287.jpg"
                alt="Video Production"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs uppercase tracking-wider font-light">Video</p>
                <p className="text-xs uppercase tracking-wider font-light">Production</p>
              </div>
            </div>

            {/* Image 4 */}
            <div 
              className="relative aspect-square overflow-hidden rounded-sm group"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <Image
                src="/assets/5cd64b86-f29d-4b35-8806-162c18542a5b(1).jpg"
                alt="Live Streaming"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs uppercase tracking-wider font-light">Live</p>
                <p className="text-xs uppercase tracking-wider font-light">Streaming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Below Images - Two Column Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Column - Main Heading */}
          <div className="text-left">
            <h1 
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-6 md:mb-8"
              style={{ color: 'var(--ink)' }}
            >
              THE <span className="font-script italic text-4xl sm:text-5xl md:text-5xl lg:text-6xl">studio space</span>
              <br className="hidden sm:block" />
              WHERE CREATIVITY MEETS
              <br className="hidden sm:block" />
              PROFESSIONAL EXCELLENCE
            </h1>
            
            {/* Social Proof - Star Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--gold)' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span 
                className="text-sm md:text-base font-light"
                style={{ color: 'var(--muted-foreground)' }}
              >
                4.9/5 from 200+ creators
              </span>
            </div>
          </div>

          {/* Right Column - Description and CTAs */}
          <div className="flex flex-col justify-start">
            {/* Description */}
            <p 
              className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 lg:mb-12 leading-relaxed font-light text-left"
              style={{ color: 'var(--muted-foreground)' }}
            >
              R&T Spaces delivers world-class studio environments designed for creators who demand excellence. 
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
                  Book a Session
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
                href="/gallery"
                className="btn-secondary group min-w-[180px]"
              >
                <span className="flex items-center gap-2">
                  View Portfolio
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
    </section>
  );
}
