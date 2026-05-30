import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import { ConvexAuthProvider } from "@/components/auth/convex-auth-provider";
import { SignInDialogProvider } from "@/components/auth/sign-in-dialog";
import { EmbeddedInitScript } from "@/components/embedded/embedded-init-script";
import { EmbeddedThemeBridge } from "@/components/embedded/embedded-theme-bridge";
import { PageBackground } from "@/components/page-background";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import "./globals.css";

const siteUrl = getSiteUrl();
const description =
  "Stella is your personal AI assistant that lives on your computer. Chat, voice, scheduling, and a fully customizable interface.";
const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

// Cormorant Garamond is a variable font: a single file per style covers the
// full 300–600 weight range we use, so we rely on the variable axis instead of
// enumerating discrete weights. This collapses dozens of redundant @font-face
// rules and lets in-between weights (e.g. 450) interpolate correctly.
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
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
  // og:/twitter: title and description are intentionally omitted so each
  // route's own title + description flow into the social tags. The homepage
  // falls back to the default title and root `description`.
  openGraph: {
    siteName: "Stella",
    type: "website",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
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
};

export const viewport: Viewport = {
  themeColor: "#f3f8ff",
  colorScheme: "light",
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
      sameAs: ["https://x.com/stella", "https://github.com/ruuxi/stella"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl.origin}/#app`,
      name: "Stella",
      description,
      url: siteUrl.origin,
      applicationCategory: "BusinessApplication",
      operatingSystem: "macOS, Windows",
      publisher: { "@id": `${siteUrl.origin}/#organization` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
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
      <head>
        <EmbeddedInitScript />
      </head>
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PageBackground />
        <ConvexAuthProvider>
          <SignInDialogProvider>{children}</SignInDialogProvider>
        </ConvexAuthProvider>
        <EmbeddedThemeBridge />
        <RevealOnScroll />
      </body>
    </html>
  );
}
