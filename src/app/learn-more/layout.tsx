import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FooterLegalLinks } from "@/components/footer-legal-links";
import { homeFooterGroups } from "@/components/site-footer-groups";
import { SiteHeader } from "@/components/site-header";
import "./learn-more.css";

export default function LearnMoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="stella-page">
      <SiteHeader />

      {children}

      <footer className="grid-shell site-footer section-border">
        <div className="footer-brand">
          <Link className="brand-mark brand-mark--footer" href="/">
            <Image
              src="/stella-logo.svg"
              alt="Stella"
              width={42}
              height={42}
            />
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
                      <Link href={item.href}>{item.label}</Link>
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
