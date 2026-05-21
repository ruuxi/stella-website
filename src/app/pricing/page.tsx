import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import "./pricing.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Stella pricing — start free, upgrade when you need more. Monthly plans; Go starts at $5 for your first month.",
  alternates: { canonical: "/pricing" },
};

// Mirrors `STATIC_PLAN_DISPLAY`, `PLAN_USAGE_TAGLINE`,
// `BASE_PLAN_FEATURES` and `PRIORITY_PLAN_FEATURE` in
// `src/app/billing/billing-client.tsx` so /pricing and /billing always
// describe the same plans.
//
// When the Go intro promo runs in Convex
// (`STELLA_GO_INTRO_FIRST_MONTH_PRICE_CENTS`), keep `introFirstMonthPriceUsd`
// here in sync so marketing matches `/billing`.
const BASE_FEATURES = [
  "Voice features",
  "Image, video, audio and 3D generation",
];
const PRIORITY_FEATURE = "Higher priority, increased speeds";

const plans: {
  name: string;
  price: number;
  /** Shown alongside recurring `price`; must match Convex intro cents ÷ 100. */
  introFirstMonthPriceUsd?: number;
  tagline: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    name: "Free",
    price: 0,
    tagline: "Light usage to try Stella",
    features: [...BASE_FEATURES],
  },
  {
    name: "Go",
    price: 20,
    introFirstMonthPriceUsd: 5,
    tagline: "Baseline monthly usage",
    features: [...BASE_FEATURES],
  },
  {
    name: "Pro",
    price: 60,
    tagline: "3x the usage of Go",
    featured: true,
    features: [PRIORITY_FEATURE, ...BASE_FEATURES],
  },
  {
    name: "Plus",
    price: 100,
    tagline: "5x the usage of Go",
    features: [PRIORITY_FEATURE, ...BASE_FEATURES],
  },
  {
    name: "Ultra",
    price: 200,
    tagline: "10x the usage of Go",
    features: [PRIORITY_FEATURE, ...BASE_FEATURES],
  },
];

const included = [
  "Runs on your computer",
  "Private by default",
  "Customizable interface",
  "Desktop and mobile access",
];

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
    items: [{ label: "What's New", href: "/learn-more#whats-new" }],
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

export default function Pricing() {
  return (
    <div className="stella-page">
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section className="grid-shell pr-hero section-border">
          <div className="pr-article">
            <h1 className="pr-title reveal">
              <span>Simple,</span> transparent pricing
            </h1>
            <p className="pr-subtitle reveal reveal-delay-1">
              Every plan includes the full Stella experience. The only thing
              that changes between tiers is how much you can use each month.
            </p>
          </div>
        </section>

        {/* ── Plan cards ───────────────────────────── */}
        <section className="grid-shell pr-section section-border">
          <div className="pr-grid-wrap">
            <div className="pr-grid">
              {plans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={`pr-card reveal${plan.featured ? " pr-card--featured" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {plan.featured && (
                    <span className="pr-card__badge">Popular</span>
                  )}

                  <div className="pr-card__head">
                    <h3 className="pr-card__name">{plan.name}</h3>
                    {typeof plan.introFirstMonthPriceUsd === "number" &&
                    plan.introFirstMonthPriceUsd > 0 &&
                    plan.introFirstMonthPriceUsd < plan.price ? (
                      <div className="pr-card__price-bundle">
                        <div className="pr-card__price pr-card__price--intro-offer">
                          <span className="pr-card__amount">
                            ${plan.introFirstMonthPriceUsd}
                          </span>
                          <span className="pr-card__period pr-card__period--phrase">
                            first month
                          </span>
                        </div>
                        <p className="pr-card__price-then">
                          Then{" "}
                          <strong>${plan.price}</strong>
                          <span aria-hidden="true">/mo</span> after that
                        </p>
                      </div>
                    ) : (
                      <div className="pr-card__price">
                        <span className="pr-card__amount">
                          ${plan.price}
                        </span>
                        {plan.price > 0 ? (
                          <span className="pr-card__period">/mo</span>
                        ) : null}
                      </div>
                    )}
                    <p className="pr-card__tagline">{plan.tagline}</p>
                  </div>

                  <ul className="pr-card__features">
                    {plan.features.map((f) => (
                      <li key={f}>
                        <Check size={14} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Every plan includes ──────────────────── */}
        <section className="grid-shell pr-section section-border">
          <div className="pr-article">
            <h2>Every plan includes</h2>
            <ul className="pr-included">
              {included.map((item) => (
                <li key={item}>
                  <Check size={15} strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section className="grid-shell pr-cta-section">
          <div className="pr-article pr-cta reveal">
            <h2>Start with Stella for free</h2>
            <p>
              No credit card required. Download Stella and try it today.
            </p>
            <Link className="button button--primary" href="/">
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
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
          <ul className="legal-links">
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
          </ul>
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
