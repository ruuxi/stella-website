"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SiteNav } from "@/components/site-nav";

const SCROLL_RANGE = 140;

export function SiteHeader() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY);
      const p = Math.min(1, y / SCROLL_RANGE);
      el.style.setProperty("--scroll-progress", p.toFixed(4));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      ref={ref}
      className="grid-shell grid-shell--dense site-header"
    >
      <div className="brand-wrap">
        <Link className="brand-mark" href="/">
          <span className="brand-mark__logo">
            <Image
              className="brand-mark__logo-img"
              src="/stella-logo.svg"
              alt=""
              width={64}
              height={64}
              priority
            />
          </span>
          <span className="brand-text">Stella</span>
        </Link>
      </div>

      <SiteNav />
    </header>
  );
}
