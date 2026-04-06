"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={toggle}
      >
        Menu
      </button>

      <div
        className={`mobile-nav-overlay${open ? " mobile-nav-overlay--open" : ""}`}
        aria-hidden={!open}
        onClick={close}
      />

      <nav
        className={`mobile-nav-drawer${open ? " mobile-nav-drawer--open" : ""}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-drawer__header">
          <span className="brand-text">Stella</span>
          <button
            className="mobile-nav-drawer__close"
            type="button"
            aria-label="Close menu"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mobile-nav-drawer__links">
          {items.map((item) => (
            <a key={item.label} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
