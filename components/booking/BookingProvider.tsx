"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { BookingDrawer } from "./BookingDrawer";

type Offer = "hire" | "session";
type BookingPrefill = { offer?: Offer; packageId?: string };

type BookingContextValue = {
  isOpen: boolean;
  openBooking: (prefill?: BookingPrefill) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<BookingPrefill | null>(null);

  const openBooking = useCallback((p?: BookingPrefill) => {
    setPrefill(p ?? null);
    setIsOpen(true);
  }, []);
  const closeBooking = useCallback(() => setIsOpen(false), []);

  return (
    <BookingContext.Provider value={{ isOpen, openBooking, closeBooking }}>
      {children}
      <BookingDrawer isOpen={isOpen} onClose={closeBooking} prefill={prefill} />
    </BookingContext.Provider>
  );
}
