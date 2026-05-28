import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { HomeDesktopMock } from "@/components/home-desktop-mock";
import { HeroMorphTitle } from "@/components/hero-morph-title";
import { HeroStellaOrb } from "@/components/hero-stella-orb-dynamic";
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
      { label: "Sign In", href: "/sign-in" },
    ],
  },
  {
    title: "Resources",
    items: [{ label: "What's New", href: "/learn-more/whats-new" }],
  },
  {
    title: "Community",
    items: [
      {
        label: "Discord",
        href: "https://discord.gg/HXVCCeE542",
        external: true,
      },
    ],
  },
];

export default function Home() {
  return (
    <div className="stella-page">
      <SiteHeader />

      <main>
        <section className="grid-shell hero-section section-border">
          <div className="hero-stack">
            <div className="hero-stack__orb">
              <HeroStellaOrb />
            </div>
            <div className="hero-stack__title reveal">
              <HeroMorphTitle />
            </div>
            <div className="hero-stack__cta reveal reveal-delay-2">
              <DownloadButton />
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
          </div>
          <p className="hero-preview-badge reveal">Stella is in research preview</p>
        </section>
        <HomeDesktopMock />
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
