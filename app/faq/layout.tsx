import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — RT Spaces",
  description: "Frequently asked questions about booking, equipment, opening hours, and studio policies at RT Spaces East London.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
