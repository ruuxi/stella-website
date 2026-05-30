import Image from "next/image";
import Link from "next/link";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { homeFooterGroups } from "@/components/site-footer-groups";
import { HomeCanvasDemos } from "@/components/home-canvas-demos";
import { HomeComputerUse } from "@/components/home-computer-use";
import { HomeDesktopMock } from "@/components/home-desktop-mock";
import { HomeDocuments } from "@/components/home-documents";
import { HomeHero } from "@/components/home-hero";
import { HomeMemorySystem } from "@/components/home-memory-system";
import { HomeOpenPrivate } from "@/components/home-open-private";
import { HomePhoneConnectors } from "@/components/home-phone-connectors";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="stella-page">
      <SiteHeader />

      <main>
        <HomeHero />
        <HomeDesktopMock />
        <HomeCanvasDemos />
        <HomeComputerUse />
        <HomePhoneConnectors />
        <HomeDocuments />
        <HomeMemorySystem />
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
          {homeFooterGroups.map((group) => (
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
