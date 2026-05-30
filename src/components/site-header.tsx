import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="grid-shell grid-shell--dense site-header">
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
