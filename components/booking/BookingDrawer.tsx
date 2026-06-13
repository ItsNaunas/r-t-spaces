"use client";

import { useEffect } from "react";
import { BookingWizard } from "./BookingWizard";

type Offer = "hire" | "session";
type BookingPrefill = { offer?: Offer; packageId?: string } | null;

export function BookingDrawer({
  isOpen,
  onClose,
  prefill,
}: {
  isOpen: boolean;
  onClose: () => void;
  prefill: BookingPrefill;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Book the studio"
        className={`fixed inset-y-0 right-0 z-[101] flex w-full max-w-full flex-col bg-[var(--base)] shadow-2xl transition-transform duration-300 sm:max-w-md ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--lavender)] bg-white px-5 py-4">
          <p className="font-heading text-lg text-[var(--primary)]">Book the studio</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking"
            className="flex h-9 w-9 items-center justify-center text-[var(--muted-plum)] transition-colors hover:text-[var(--primary)]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1">
          {isOpen && <BookingWizard prefill={prefill} onClose={onClose} />}
        </div>
      </aside>
    </>
  );
}
