 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Studio", href: "/studio" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-black"
          onClick={closeMenu}
        >
          R&amp;T Spaces
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition hover:text-black ${
                pathname === link.href ? "text-black" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="hidden rounded-full border border-black bg-black px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition-colors hover:-translate-y-0.5 hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:inline-flex"
        >
          Book studio
        </Link>
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          Menu
        </button>
      </div>
      {menuOpen && (
        <div
          id="mobile-nav"
          className="space-y-4 border-t border-zinc-200 px-4 pb-6 pt-4 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-600 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-full border border-zinc-200 px-4 py-3 text-center transition hover:border-black hover:text-black ${
                pathname === link.href ? "border-black text-black" : ""
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block rounded-full border border-black bg-black px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            onClick={closeMenu}
          >
            Book studio
          </Link>
        </div>
      )}
    </header>
  );
}

