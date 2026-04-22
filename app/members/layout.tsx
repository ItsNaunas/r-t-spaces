import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members — RT Spaces",
  description: "RT Spaces membership plans for regular studio users. Priority booking, discounted rates, and exclusive member perks in East London.",
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
