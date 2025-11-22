"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ src: string; alt: string; artist?: string; focus?: string }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function Lightbox({ isOpen, onClose, images, currentIndex, onNavigate }: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsLoading(true);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[101] text-white/80 hover:text-white transition-colors p-2"
        aria-label="Close lightbox"
      >
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-4 z-[101] text-white/80 hover:text-white transition-colors p-4 bg-black/50 rounded-full"
            aria-label="Previous image"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex + 1) % images.length);
            }}
            className="absolute right-4 z-[101] text-white/80 hover:text-white transition-colors p-4 bg-black/50 rounded-full"
            aria-label="Next image"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-full h-full max-w-6xl">
            <Image
              src={currentImage.src}
              alt={currentImage.alt || currentImage.focus || ""}
              fill
              sizes="100vw"
              className="object-contain"
              priority
              quality={90}
              onLoad={() => setIsLoading(false)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Image Info */}
          {(currentImage.artist || currentImage.focus) && (
            <div className="mt-6 text-center text-white/90 max-w-2xl">
              {currentImage.focus && (
                <p className="text-sm uppercase tracking-[0.3em] text-white/60 mb-2">
                  {currentImage.focus}
                </p>
              )}
              {currentImage.artist && (
                <p className="text-xl font-semibold">{currentImage.artist}</p>
              )}
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="mt-4 text-sm text-white/60">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

