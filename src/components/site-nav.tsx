"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { SiteHeaderAccount } from "@/components/auth/site-header-account";
import {
  chromeExtensionLink,
  openSourceFooterItems,
} from "@/components/site-footer-groups";

type NavLink = { label: string; href: string; external?: boolean };
type NavEntry = {
  label: string;
  href?: string;
  external?: boolean;
  items?: NavLink[];
};

const NAV_ENTRIES: NavEntry[] = [
  {
    label: "Product",
    items: [
      { label: "Learn More", href: "/learn-more" },
      { label: "Memory", href: "/memory" },
      { label: "Storage", href: "/storage" },
      { label: "Agents", href: "/agents" },
      { label: "Voice", href: "/voice" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "What's New", href: "/learn-more/whats-new" },
      chromeExtensionLink,
      { label: "Install for macOS", href: "/install.sh" },
      { label: "Install for Windows", href: "/install.ps1" },
    ],
  },
  {
    label: "Open Source",
    items: openSourceFooterItems,
  },
  {
    label: "Community",
    items: [
      { label: "Discord", href: "https://discord.gg/HXVCCeE542", external: true },
      { label: "Store", href: "/store" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

function NavItemLink({
  item,
  onNavigate,
  className,
}: {
  item: NavLink;
  onNavigate?: () => void;
  className?: string;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

/**
 * Primary site navigation used in every marketing-page header.
 *
 * On wide screens each top-level tab is either a direct link (Store) or a
 * footer-style category (Product, Resources, Community) that reveals its
 * links in a popover on hover or keyboard focus.
 *
 * On narrow screens (<= 860px) the tabs collapse into a hamburger sheet that
 * lists every category and its links. The `SiteHeaderAccount` sign-in button
 * stays in the header bar at all widths — auth is the single most important
 * CTA.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <nav className="site-nav" aria-label="Primary">
      <div className="site-nav__inline">
        {NAV_ENTRIES.map((entry) =>
          entry.items ? (
            <div key={entry.label} className="site-nav__group">
              <button
                type="button"
                className="site-nav__trigger"
                aria-haspopup="true"
              >
                {entry.label}
                <ChevronDown size={13} aria-hidden="true" />
              </button>
              <div className="site-nav__menu">
                <div className="site-nav__panel">
                  {entry.items.map((item) => (
                    <NavItemLink key={item.label} item={item} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <NavItemLink
              key={entry.label}
              item={{
                label: entry.label,
                href: entry.href as string,
                external: entry.external,
              }}
            />
          )
        )}
      </div>

      <SiteHeaderAccount />

      <button
        type="button"
        className="site-nav__toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-nav-mobile"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {open ? (
        <button
          type="button"
          className="site-nav__backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id="site-nav-mobile"
        className="site-nav__sheet"
        data-open={open ? "true" : "false"}
        hidden={!open}
      >
        {NAV_ENTRIES.map((entry) =>
          entry.items ? (
            <div key={entry.label} className="site-nav__sheet-group">
              <p className="site-nav__sheet-title">{entry.label}</p>
              <ul>
                {entry.items.map((item) => (
                  <li key={item.label}>
                    <NavItemLink item={item} onNavigate={() => setOpen(false)} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div key={entry.label} className="site-nav__sheet-group">
              <ul>
                <li>
                  <NavItemLink
                    item={{
                      label: entry.label,
                      href: entry.href as string,
                      external: entry.external,
                    }}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              </ul>
            </div>
          )
        )}
      </div>
    </nav>
  );
}
