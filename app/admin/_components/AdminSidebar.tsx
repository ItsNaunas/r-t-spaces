"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/discounts", label: "Discount Codes" },
  { href: "/admin/packages", label: "Packages" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
              active
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  return (
    <div className="p-3 border-t border-gray-200">
      <form action="/api/admin/logout" method="POST">
        <button
          type="submit"
          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <div>
          <p className="font-semibold text-gray-900 text-sm">RT Spaces</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect y="2" width="18" height="1.5" rx="0.75" fill="currentColor" />
            <rect y="8.25" width="18" height="1.5" rx="0.75" fill="currentColor" />
            <rect y="14.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">RT Spaces</p>
                <p className="text-xs text-gray-400 mt-0.5">Admin</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <SignOutButton />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-52 min-h-screen bg-white border-r border-gray-200 flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-200">
          <p className="font-semibold text-gray-900 text-sm">RT Spaces</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>
        <NavLinks />
        <SignOutButton />
      </aside>
    </>
  );
}
