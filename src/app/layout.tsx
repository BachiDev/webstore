// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers"; // Import the new Providers component

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://bachidev-webstore.web.app";
const description =
  "Demo storefront by Fabian Bachmayer: Next.js + Firebase + Stripe test payments — auth, cart, checkout, subscriptions, and gated content.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Webstore Demo",
    template: "%s · Webstore Demo",
  },
  description,
  authors: [{ name: "Fabian Bachmayer", url: "https://bachi.dev" }],
  keywords: ["Next.js", "Firebase", "Stripe", "demo store", "Fabian Bachmayer"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Webstore Demo",
    title: "Webstore Demo",
    description,
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Webstore Demo — Next.js + Firebase + Stripe in test mode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webstore Demo",
    description,
    images: ["/og-cover.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Webstore Demo",
  url: siteUrl,
  author: {
    "@type": "Person",
    name: "Fabian Bachmayer",
    url: "https://bachi.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Product images load straight from the Stripe CDN (no optimizer on
          this stack) — preconnect once so the LCP image skips DNS+TLS. */}
      <link rel="preconnect" href="https://files.stripe.com" />
      <body
        className={`${inter.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </body>
    </html>
  );
}
