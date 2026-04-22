import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — RT Spaces",
  description: "Browse our studio photography gallery — portraits, events, and creative sessions from RT Spaces in East London.",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
