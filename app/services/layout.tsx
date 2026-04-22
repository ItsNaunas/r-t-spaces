import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — RT Spaces",
  description: "Studio hire rates and session packages at RT Spaces East London. Hourly hire, portrait packages, and membership options available.",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
