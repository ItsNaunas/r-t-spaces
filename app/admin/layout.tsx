import type { Metadata } from "next";
import { AdminSidebar } from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin — RT Spaces",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pt-14 sm:pt-0">{children}</main>
    </div>
  );
}
