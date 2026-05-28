"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SiteHeaderAccount } from "@/components/auth/site-header-account";

type NavItem = { label: string; href: string; external?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "/learn-more" },
  { label: "Solutions", href: "/how-it-works" },
  { label: "Developers", href: "https://github.com/ruuxi/stella", external: true },
  { label: "Resources", href: "/learn-more/whats-new" },
  { label: "Pricing", href: "/pricing" },
  { label: "Store", href: "/store" },
];

/**
 * Primary site navigation used in every marketing-page header.
 *
 * On wide screens it renders the inline horizontal links plus the
 * `SiteHeaderAccount` button, matching the historical `.site-nav` layout.
 *
 * On narrow screens (<= 860px) the inline links collapse into a hamburger
 * toggle that opens a full-width sheet from the top of the viewport. The
 * `SiteHeaderAccount` sign-in button stays visible in the header bar
 * regardless of viewport — auth is the single most important CTA, and the
 * sign-in dialog is more important than secondary nav links.
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
        {NAV_ITEMS.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ) : (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
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
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
