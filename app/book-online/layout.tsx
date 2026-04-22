import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Online — RT Spaces",
  description: "Book your studio session at RT Spaces East London. Choose a package, pick your date, and secure your slot online.",
};

export default function BookOnlineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
