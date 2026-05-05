import type { Metadata } from "next";
import { AdminSidebar } from "./_components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin — RT Spaces",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
