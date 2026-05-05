"use client";

import { usePathname } from "next/navigation";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingBookButton } from "@/components/FloatingBookButton";

export function PublicChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <FloatingBookButton />
    </>
  );
}
