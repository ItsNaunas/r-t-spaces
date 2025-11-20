 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Studios", href: "/studio" },
  { label: "Pricing", href: "/services" },
  { label: "Our Work", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOverLightSection, setIsOverLightSection] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Hero section is full viewport height (h-screen = 100vh)
      // We're over the hero if we haven't scrolled past the viewport height
      const heroHeight = window.innerHeight;
      const isOverHero = scrollY < heroHeight;
      
      // isOverLightSection should be true when we're past the hero (over light sections)
      setIsOverLightSection(!isOverHero);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine nav colors based on scroll position
  // isLightMode = true when over light sections (dark text), false when over hero (white text)
  const isLightMode = isOverLightSection;
  const navTextColor = isLightMode ? 'text-[var(--accent)]' : 'text-white';
  const navHoverColor = isLightMode ? 'hover:text-[var(--primary)]' : 'hover:text-[var(--primary)]';
  const navActiveColor = isLightMode ? 'text-[var(--primary)]' : 'text-white';
  const logoColor = isLightMode ? 'text-[var(--accent)]' : 'text-white';

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded focus:font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-[var(--primary)]"
      >
        Skip to main content
      </a>
      <header 
      className={`sticky top-0 z-50 w-full border-0 outline-none transition-all duration-300 ${
        isLightMode 
          ? 'bg-[var(--base)]/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`} 
      style={{ border: 'none', outline: 'none', position: 'sticky' }}
    >
      <div className={`mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 relative transition-all duration-300`}>
        <nav className={`hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.3em] ${navTextColor}/80 md:flex flex-1`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${navHoverColor} ${
                pathname === link.href ? navActiveColor : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className={`text-lg font-semibold tracking-tight ${logoColor} absolute left-1/2 -translate-x-1/2`}
          onClick={closeMenu}
        >
          R&amp;T Spaces
        </Link>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Link
            href="https://www.instagram.com/randtspace"
            target="_blank"
            aria-label="Instagram"
            className={`${isLightMode ? 'text-[var(--accent)]/80 hover:text-[var(--primary)]' : 'text-white/80 hover:text-[var(--primary)]'} transition`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </Link>
          <Link
            href="https://www.tiktok.com/@randtspace"
            target="_blank"
            aria-label="TikTok"
            className={`${isLightMode ? 'text-[var(--accent)]/80 hover:text-[var(--primary)]' : 'text-white/80 hover:text-[var(--primary)]'} transition`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className={`btn-small hidden md:inline-flex ${isLightMode ? 'btn-primary text-[var(--base)]' : 'btn-hero-white'}`}
          >
            Get In Touch!
          </Link>
          <button
            type="button"
            className={`btn-small inline-flex items-center md:hidden ${isLightMode ? 'text-[var(--accent)]' : 'text-white'}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </div>
      {menuOpen && (
        <div
          id="mobile-nav"
          className={`space-y-4 border-t ${isLightMode ? 'border-[var(--accent)]/20' : 'border-white/20'} px-4 pb-6 pt-4 text-sm font-semibold uppercase tracking-[0.3em] ${isLightMode ? 'text-[var(--accent)]/80' : 'text-white/80'} md:hidden`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block border ${isLightMode ? 'border-[var(--accent)]/20 hover:border-[var(--primary)]' : 'border-white/20 hover:border-white'} px-4 py-3 text-center transition ${
                pathname === link.href ? (isLightMode ? "border-[var(--primary)] text-[var(--primary)]" : "border-white text-white") : ""
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={`btn-small block text-center ${isLightMode ? 'btn-primary text-[var(--base)]' : 'btn-hero-white'}`}
            onClick={closeMenu}
          >
            Get In Touch!
          </Link>
        </div>
      )}
    </header>
    </>
  );
}

