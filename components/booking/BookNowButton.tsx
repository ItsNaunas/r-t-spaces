"use client";

import { type ReactNode, type MouseEvent, type CSSProperties } from "react";
import { useBooking } from "./BookingProvider";

type Offer = "hire" | "session";

export function BookNowButton({
  children,
  className,
  style,
  offer,
  packageId,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  offer?: Offer;
  packageId?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
}) {
  const { openBooking } = useBooking();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      style={style}
      onClick={(e) => {
        onClick?.(e);
        openBooking(offer || packageId ? { offer, packageId } : undefined);
      }}
    >
      {children}
    </button>
  );
}
