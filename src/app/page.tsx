import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { HomeDesktopMock } from "@/components/home-desktop-mock";
import { HomeHeroProductShot } from "@/components/home-hero-product-shot";
import { HomeStripeSections } from "@/components/home-stripe-sections";
import { SiteHeader } from "@/components/site-header";

const footerGroups: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    items: [
      { label: "Learn More", href: "/learn-more" },
      { label: "Store", href: "/store" },
      { label: "Pricing", href: "/pricing" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
  {
    title: "Surfaces",
    items: [
      { label: "Desktop Window", href: "/learn-more" },
      { label: "Mini Window", href: "/learn-more" },
      { label: "Phone and Connectors", href: "/learn-more" },
      { label: "Voice and Dictation", href: "/learn-more" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "What's New", href: "/learn-more/whats-new" },
      { label: "Changelog", href: "/changelog" },
      { label: "Install for macOS", href: "/install.sh" },
      { label: "Install for Windows", href: "/install.ps1" },
    ],
  },
  {
    title: "Developers",
    items: [
      {
        label: "GitHub",
        href: "https://github.com/ruuxi/stella",
        external: true,
      },
      {
        label: "Chrome Extension",
        href: "https://chromewebstore.google.com/detail/stella-browser/kfnchfpocpmdblhfgcnpfaaebaioojnl",
        external: true,
      },
      {
        label: "Backend Repo",
        href: "https://github.com/ruuxi/stella-backend",
        external: true,
      },
      {
        label: "Mobile Repo",
        href: "https://github.com/ruuxi/stella-mobile",
        external: true,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Discord",
        href: "https://discord.gg/HXVCCeE542",
        external: true,
      },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const heroSurfaceItems = [
  "Chat",
  "Desktop",
  "Browser",
  "Voice",
  "Phone",
  "Docs",
  "Store",
];

export default function Home() {
  return (
    <div className="stella-page">
      <SiteHeader />

      <main>
        <section className="grid-shell hero-section section-border">
          <div className="hero-copy reveal">
            <p className="hero-eyebrow">Stella is in research preview</p>
            <div
              className="hero-surface-strip"
              aria-label="Personal work running through Stella"
            >
              <span>Personal work running through Stella:</span>
              <ul>
                {heroSurfaceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <h1>The world&apos;s first personal software.</h1>
            <p className="hero-dek">
              One ongoing conversation that can use your desktop, browser,
              files, phone, voice, memory, and background agents. Everything
              can change, including the interface itself.
            </p>
            <div className="hero-actions">
              <DownloadButton />
              <a
                className="button button--ghost"
                href="https://github.com/ruuxi/stella"
                target="_blank"
                rel="noopener noreferrer"
              >
                View GitHub
                <Github size={15} aria-hidden="true" />
              </a>
            </div>
            <dl className="hero-proof-row" aria-label="Stella proof points">
              <div>
                <dt>Local</dt>
                <dd>Your data stays on your computer</dd>
              </div>
              <div>
                <dt>Open</dt>
                <dd>UI, prompts, skills, and runtime can change</dd>
              </div>
              <div>
                <dt>One chat</dt>
                <dd>No thread sprawl or history to manage</dd>
              </div>
            </dl>
          </div>
          <div className="hero-product-column reveal reveal-delay-1">
            <HomeHeroProductShot />
            <p className="hero-research-note">
              Private.{" "}
              <a
                className="hero-research-note__link"
                href="https://github.com/ruuxi/stella"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open source.
                <Github size={14} aria-hidden="true" />
              </a>
            </p>
          </div>
        </section>
        <HomeDesktopMock />
        <HomeStripeSections />
      </main>

      <footer className="grid-shell site-footer section-deferred-render section-border">
        <div className="footer-brand">
          <Link className="brand-mark brand-mark--footer" href="/">
            <Image src="/stella-logo.svg" alt="Stella" width={42} height={42} />
            <span className="brand-text">Stella</span>
          </Link>

          <FooterLegalLinks />
        </div>

        <div className="footer-columns">
          {footerGroups.map((group) => (
            <div key={group.title} className="footer-column">
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <a href={item.href}>{item.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
