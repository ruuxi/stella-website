import Image from "next/image";
import Link from "next/link";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { HomeComputerUse } from "@/components/home-computer-use";
import { HomeDesktopMock } from "@/components/home-desktop-mock";
import { HomeDocuments } from "@/components/home-documents";
import { HomeOpenPrivate } from "@/components/home-open-private";
import { HomePhoneConnectors } from "@/components/home-phone-connectors";
import { HomeSelfmod } from "@/components/home-selfmod";
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

export default function Home() {
  return (
    <div className="stella-page">
      <SiteHeader />

      <main>
        <HomeDesktopMock />
        <HomeComputerUse />
        <HomePhoneConnectors />
        <HomeSelfmod />
        <HomeDocuments />
        <HomeOpenPrivate />
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
