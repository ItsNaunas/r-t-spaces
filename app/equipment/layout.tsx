import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipment — RT Spaces",
  description: "Professional photography equipment included at RT Spaces — studio lighting, backdrops, and camera gear in East London.",
};

export default function EquipmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
