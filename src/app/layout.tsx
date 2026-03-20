import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
/* Product demos (self-mod, radial, canvas) — partials in ./demos/ */
import "./demos.css";

const siteUrl = getSiteUrl();
const description =
  "Stella is your personal AI assistant that lives on your computer. Chat, voice, scheduling, and a fully customizable interface.";
const ogDescription =
  "Your personal AI assistant. Chat, voice, automation, and a fully customizable interface — all in one place.";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  preload: true,
  adjustFontFallback: true,
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  preload: false,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Stella — Personal AI assistant for your computer",
    template: "%s | Stella",
  },
  description,
  applicationName: "Stella",
  keywords: [
    "Stella",
    "AI assistant",
    "personal AI",
    "desktop AI",
    "voice assistant",
    "AI scheduling",
    "computer assistant",
  ],
  authors: [{ name: "Stella" }],
  creator: "Stella",
  publisher: "Stella",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Stella",
    description: ogDescription,
    siteName: "Stella",
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stella",
    description: ogDescription,
    site: "@stella",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
  icons: {
    icon: [{ url: "/stella-logo.svg", type: "image/svg+xml" }],
    shortcut: "/stella-logo.svg",
    apple: "/stella-logo.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl.origin}/#website`,
      url: siteUrl.origin,
      name: "Stella",
      description,
      publisher: { "@id": `${siteUrl.origin}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl.origin}/#organization`,
      name: "Stella",
      url: siteUrl.origin,
      logo: new URL("/stella-logo.svg", siteUrl).href,
      sameAs: ["https://x.com/stella"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
