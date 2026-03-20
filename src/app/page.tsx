import dynamic from "next/dynamic";
import Image from "next/image";
import { Circle, Sparkles } from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { HeroStellaOrb } from "@/components/hero-stella-orb-dynamic";
import { DeferInView } from "@/components/product-demos/defer-in-view";

const ProductDemos = dynamic(
  () =>
    import("@/components/product-demos/product-demos").then((mod) => mod.ProductDemos),
  {
    loading: () => (
      <div
        className="demo-showcase-grid demo-showcase-grid--loading"
        aria-busy="true"
        aria-label="Loading product demos"
      >
        <div className="demo-panel" />
        <div className="demo-panel" />
        <div className="demo-panel" />
      </div>
    ),
  },
);

function ProductDemosFallback() {
  return (
    <div
      className="demo-showcase-grid demo-showcase-grid--loading"
      aria-busy="true"
      aria-label="Loading product demos"
    >
      <div className="demo-panel" />
      <div className="demo-panel" />
      <div className="demo-panel" />
    </div>
  );
}

const navItems = [
  "What's New",
  "How It Works",
  "Download",
  "Pricing",
];

const showcaseCards = [
  {
    title: "Plan my week and check in every morning with a summary",
    author: "JM",
    authorName: "jamie",
    detail: "Scheduling",
    time: "3 min setup",
  },
  {
    title: "Research birthday gift ideas and compare prices across stores",
    author: "SL",
    authorName: "sara",
    detail: "Web search",
    time: "2 min chat",
  },
  {
    title: "Redesign my Stella homepage with a cozy autumn theme",
    author: "TK",
    authorName: "toby",
    detail: "Customization",
    time: "1 prompt",
  },
  {
    title: "Summarize this long article and pull out the key takeaways",
    author: "RN",
    authorName: "riya",
    detail: "Reading",
    time: "Instant",
  },
];

const announcements = [
  {
    date: "March 12, 2026",
    title: "Smarter daily check-ins",
    blurb: "Morning summaries now highlight what actually matters instead of listing everything.",
  },
  {
    date: "March 4, 2026",
    title: "Longer conversations, no lost thread",
    blurb: "Stella remembers what you talked about even in really long back-and-forth sessions.",
  },
  {
    date: "February 25, 2026",
    title: "Stella can multitask",
    blurb: "Ask for several things at once and Stella works on them at the same time.",
  },
  {
    date: "February 18, 2026",
    title: "Voice just got better",
    blurb: "Talk to Stella anywhere on your screen and pick up right where you left off.",
  },
  {
    date: "February 7, 2026",
    title: "Easier setup",
    blurb: "Download, install, and you're ready. That's it.",
  },
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

export default function Home() {
  return (
    <div className="stella-page">
      <header className="grid-shell grid-shell--dense site-header">
        <div className="brand-wrap">
          <a className="brand-mark" href="#">
            <span className="brand-mark__logo">
              <Image
                className="brand-mark__logo-img"
                src="/stella-logo.svg"
                alt=""
                width={108}
                height={108}
                priority
              />
            </span>
            <span className="brand-text">Stella</span>
          </a>
        </div>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
          <a href="#">Sign In</a>
          <a className="button button--compact button--accent" href="#">
            Get Started
          </a>
        </nav>

        <button className="mobile-nav-toggle" type="button" aria-label="Open menu">
          Menu
        </button>
      </header>

      <main>
        <section className="grid-shell hero-section section-border">
          <div className="hero-title reveal">
            <h1>
              <span>Your Computer,</span>
              <br />
              Finally Yours
            </h1>
          </div>

          <div className="hero-copy reveal reveal-delay-1">
            <p>
              Stella lives on your computer to do anything you need.
            </p>
            <p className="hero-copy__subtle">
              Private by design. Entirely yours.
            </p>
          </div>

          <HeroStellaOrb />

          <div className="hero-actions reveal reveal-delay-2">
            <DownloadButton />
          </div>
        </section>

        <section className="grid-shell showcase-section section-border">
          <div className="section-kicker">
            <span>Product</span>
            <h2>See Stella in motion</h2>
          </div>

          <div className="product-demos-slot">
            <DeferInView fallback={<ProductDemosFallback />} rootMargin="360px 0px">
              <ProductDemos />
            </DeferInView>
          </div>
        </section>

        <section className="grid-shell showcase-section showcase-section--deferred section-border">
          <div className="section-kicker">
            <span>People</span>
            <h2>See how people use Stella every day</h2>
          </div>

          <div className="showcase-grid">
            {showcaseCards.map((card, index) => (
              <article
                key={card.title}
                className="showcase-card reveal"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="showcase-card__mesh" aria-hidden="true" />
                <a className="showcase-card__link" href="#" aria-label={card.title} />

                <div className="showcase-card__content">
                  <div className="showcase-card__title-wrap">
                    <h3>{card.title}</h3>
                    <p className="showcase-card__author">
                      <span className="avatar-badge">{card.author}</span>
                      {card.authorName}
                    </p>
                  </div>

                  <div className="showcase-card__footer">
                    <div>
                      <p>{card.detail}</p>
                    </div>
                    <div className="showcase-card__stats">
                      <p>{card.time}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid-shell news-section section-deferred-render section-border">
          <div className="section-kicker">
            <span>News</span>
            <h2>What&apos;s new in Stella</h2>
          </div>

          <div className="news-panel reveal">
            <div className="news-panel__header">
              <span className="demo-eyebrow">Updates</span>
              <span className="news-panel__sub">Stella keeps getting better</span>
            </div>

            <div className="news-list">
              {announcements.map((item) => (
                <a key={item.title} className="news-item" href="#">
                  <p className="news-item__date">{item.date}</p>
                  <div className="news-item__body">
                    <h3>{item.title}</h3>
                    <p>{item.blurb}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="grid-shell site-footer section-deferred-render section-border">
        <div className="footer-brand">
          <a className="brand-mark brand-mark--footer" href="#">
            <Image src="/stella-logo.svg" alt="Stella" width={42} height={42} />
            <span className="brand-text">Stella</span>
          </a>

          <ul className="legal-links">
            <li>
              <a href="#">
                <Circle size={8} fill="currentColor" strokeWidth={0} />
                All Systems Operational
              </a>
            </li>
            <li>
              <a href="#">Security</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
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

        <div className="footer-note">
          <Sparkles size={14} />
          <p>Made for people who want a smarter, calmer way to get things done.</p>
        </div>
      </footer>
    </div>
  );
}
