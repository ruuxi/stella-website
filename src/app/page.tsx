import dynamic from "next/dynamic";
import Image from "next/image";
import { Circle, Sparkles } from "lucide-react";
import { DownloadButton } from "@/components/download-button";
import { HeroStellaOrb } from "@/components/hero-stella-orb-dynamic";
import { DeferInView } from "@/components/product-demos/defer-in-view";

const SelfModDemo = dynamic(
  () => import("@/components/product-demos/product-demos").then((mod) => mod.SelfModDemo),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const RadialDialDemo = dynamic(
  () => import("@/components/product-demos/product-demos").then((mod) => mod.RadialDialDemo),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const CanvasDemo = dynamic(
  () => import("@/components/product-demos/product-demos").then((mod) => mod.CanvasDemo),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

function DemoFallback() {
  return <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} />;
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

const features = [
  {
    title: "Text Stella from anywhere",
    blurb: "Message Stella from your phone, Discord, Telegram, Teams, or Slack.",
  },
  {
    title: "Collaborate with friends",
    blurb: "Invite people in, create together, and share what you make.",
  },
  {
    title: "Connect your life",
    blurb: "Bring in your calendar, Gmail, notes, and more.",
  },
  {
    title: "Create any media",
    blurb: "Apps, music, games, images, videos — just ask.",
  },
  {
    title: "Talk to Stella",
    blurb: "Say \"Stella\" and start talking. No buttons, no typing needed.",
  },
  {
    title: "Automate your routine",
    blurb: "Set up daily check-ins, reminders, and recurring tasks in plain English.",
  },
  {
    title: "Browse for you",
    blurb: "Stella can navigate websites, fill forms, and pull information from the web.",
  },
  {
    title: "Manage your files",
    blurb: "Search, organize, read, and edit files on your computer.",
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
            <h2>Make Stella entirely yours</h2>
          </div>
          <div className="product-demos-slot">
            <DeferInView fallback={<DemoFallback />} rootMargin="360px 0px">
              <SelfModDemo />
            </DeferInView>
          </div>
        </section>

        <section className="grid-shell showcase-section section-border">
          <div className="section-kicker">
            <h2>Access Stella from anywhere</h2>
          </div>
          <div className="product-demos-slot">
            <DeferInView fallback={<DemoFallback />} rootMargin="360px 0px">
              <RadialDialDemo />
            </DeferInView>
          </div>
        </section>

        <section className="grid-shell showcase-section section-border">
          <div className="section-kicker">
            <h2>Everything in one place</h2>
          </div>
          <div className="product-demos-slot">
            <DeferInView fallback={<DemoFallback />} rootMargin="360px 0px">
              <CanvasDemo />
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
            <span>More</span>
            <h2>Additional features</h2>
          </div>

          <div className="news-panel reveal">
            <div className="news-list">
              {features.map((item) => (
                <div key={item.title} className="news-item">
                  <div className="news-item__body">
                    <h3>{item.title}</h3>
                    <p>{item.blurb}</p>
                  </div>
                </div>
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
