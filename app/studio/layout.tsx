import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studios — RT Spaces",
  description: "Explore our daylight-ready photography studios in East London. Natural light, professional backdrops, and full equipment included.",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
