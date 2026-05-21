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

    // Pages like /store wrap their content in an internal scroll
    // container (e.g. `.store-root` with `overflow-y: auto`), so the
    // window itself never scrolls. Listen on whichever element is
    // actually scrolling and use the max progress across sources.
    const sources: Array<Window | Element> = [window];
    const page = el.closest(".stella-page");
    if (page) {
      for (const child of Array.from(page.children) as Element[]) {
        if (child === el) continue;
        const style = window.getComputedStyle(child);
        const oy = style.overflowY;
        if (oy === "auto" || oy === "scroll") sources.push(child);
      }
    }

    const getY = (s: Window | Element) =>
      s === window ? window.scrollY : (s as Element).scrollTop;

    let raf = 0;
    const update = () => {
      raf = 0;
      let y = 0;
      for (const s of sources) y = Math.max(y, getY(s));
      const p = Math.min(1, Math.max(0, y) / SCROLL_RANGE);
      el.style.setProperty("--scroll-progress", p.toFixed(4));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    for (const s of sources) {
      s.addEventListener("scroll", onScroll, { passive: true });
    }
    return () => {
      for (const s of sources) s.removeEventListener("scroll", onScroll);
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
