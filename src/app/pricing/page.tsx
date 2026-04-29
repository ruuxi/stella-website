import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import "./pricing.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Stella pricing — start free, upgrade when you need more. Simple plans from $0 to $200/month.",
  alternates: { canonical: "/pricing" },
};

const navItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "What's New", href: "/changelog" },
];

const plans = [
  {
    name: "Free",
    price: 0,
    tagline: "Get started with Stella",
    features: ["Basic chat & assistance", "Limited daily usage"],
  },
  {
    name: "Go",
    price: 20,
    tagline: "For everyday personal use",
    features: [
      "More conversations per day",
      "Browser automation",
      "Voice conversations",
    ],
  },
  {
    name: "Pro",
    price: 60,
    tagline: "For power users",
    featured: true,
    features: [
      "3x the usage of Go",
      "Priority response times",
      "All automation features",
    ],
  },
  {
    name: "Plus",
    price: 100,
    tagline: "For professionals",
    features: [
      "Heavy daily usage",
      "Advanced agent workflows",
      "Priority support",
    ],
  },
  {
    name: "Ultra",
    price: 200,
    tagline: "Unlimited productivity",
    features: [
      "Maximum usage limits",
      "Fastest response times",
      "Everything in Plus",
    ],
  },
];

const included = [
  "Runs on your computer",
  "Private by default",
  "Customizable interface",
  "Desktop and mobile access",
];

const footerGroups = [
  {
    title: "Product",
    items: ["Get Started", "Sign In", "Download", "Pricing"],
  },
  {
    title: "Resources",
    items: ["What's New", "Help Center", "Podcast", "Press Kit"],
  },
  {
    title: "Learn",
    items: ["Getting Started Guide", "Tips & Tricks"],
  },
  {
    title: "Community",
    items: ["X @stella", "Stella Community", "YouTube"],
  },
];

export default function Pricing() {
  return (
    <div className="stella-page">
      {/* ── Header ─────────────────────────────────── */}
      <header className="grid-shell grid-shell--dense site-header">
        <div className="brand-wrap">
          <a className="brand-mark" href="/">
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
          </a>
        </div>
        <nav className="site-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section className="grid-shell pr-hero section-border">
          <div className="pr-article">
            <h1 className="pr-title reveal">
              <span>Simple,</span> transparent pricing
            </h1>
            <p className="pr-subtitle reveal reveal-delay-1">
              Start free. Upgrade when you need more.
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
                    <div className="pr-card__price">
                      <span className="pr-card__amount">
                        ${plan.price}
                      </span>
                      <span className="pr-card__period">/mo</span>
                    </div>
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
            <a className="button button--primary" href="#">
              Get Started
              <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="grid-shell site-footer section-border">
        <div className="footer-brand">
          <a className="brand-mark brand-mark--footer" href="/">
            <Image
              src="/stella-logo.svg"
              alt="Stella"
              width={42}
              height={42}
            />
            <span className="brand-text">Stella</span>
          </a>
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
                  <li key={item}>
                    <a href="#">{item}</a>
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
