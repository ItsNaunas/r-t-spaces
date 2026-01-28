import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { FloatingBookButton } from "@/components/FloatingBookButton";
import { Analytics } from "@vercel/analytics/next";

// Playfair Display (Secondary/Heading Font)
const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: 'swap',
});

// New Icon Script (Primary Script Font)
const newIconScript = localFont({
  src: [
    { path: "../fonts/new-icon-script-regular.otf", weight: "400" },
  ],
  variable: "--font-script",
  display: 'swap',
  fallback: ['cursive'],
});

// Glacial Indifference (Accent/Sans-serif Font)
const glacialIndifference = localFont({
  src: [
    { path: "../fonts/GlacialIndifference-Regular.otf", weight: "400" },
    { path: "../fonts/GlacialIndifference-Bold.otf", weight: "700" },
  ],
  variable: "--font-sans",
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "RT Spaces — Photography Studio Hire East London",
  description:
    "RT Spaces offers daylight-ready studio hire, creative sessions, and photobooth packages in East London from 8 AM to 11 PM daily.",
  icons: {
    icon: [
      { url: '/assets/logo/social.png', sizes: 'any' },
      { url: '/assets/logo/social.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/logo/social.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/logo/social.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/assets/logo/social.png',
  },
  openGraph: {
    title: "RT Spaces — Photography Studio Hire East London",
    description:
      "RT Spaces offers daylight-ready studio hire, creative sessions, and photobooth packages in East London from 8 AM to 11 PM daily.",
    url: "https://www.rtspaces.co.uk",
    siteName: "RT Spaces",
    images: [
      {
        url: "/assets/logo/social.png", // Landscape image (1200x630) for social sharing
        width: 1200,
        height: 630,
        alt: "RT Spaces - Photography Studio Hire East London",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RT Spaces — Photography Studio Hire East London",
    description:
      "RT Spaces offers daylight-ready studio hire, creative sessions, and photobooth packages in East London from 8 AM to 11 PM daily.",
    images: ["/assets/logo/social.png"], // Landscape image for Twitter
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${newIconScript.variable} ${glacialIndifference.variable} antialiased`}
      >
        <ScrollProgress />
        <SiteHeader />
        {children}
        <FloatingBookButton />
        <Analytics />
      </body>
    </html>
  );
}
