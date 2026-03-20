import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./demos.css";

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
  title: "Stella",
  description:
    "Stella is your personal AI assistant that lives on your computer. Chat, voice, scheduling, and a fully customizable interface.",
  openGraph: {
    title: "Stella",
    description:
      "Your personal AI assistant. Chat, voice, automation, and a fully customizable interface — all in one place.",
    siteName: "Stella",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stella",
    description:
      "Your personal AI assistant. Chat, voice, automation, and a fully customizable interface — all in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
