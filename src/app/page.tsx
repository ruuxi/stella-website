import Image from "next/image";
import { ArrowRight, Circle, Sparkles } from "lucide-react";
import { HeroStellaOrb } from "@/components/hero-stella-orb";
import { ProductDemos } from "@/components/product-demos";

const navItems = [
  "Chronicle",
  "Owner's Manual",
  "Models",
  "Stella Free",
  "Pricing",
];

const showcaseCards = [
  {
    title: "Untangle a flaky checkout regression before launch",
    author: "AK",
    authorName: "averyk",
    prompts: "6 prompts",
    files: "18 files",
    delta: "+842",
    minus: "-103",
    approx: "~41",
  },
  {
    title: "Plan a TypeScript workspace migration with guardrails",
    author: "ML",
    authorName: "mlee",
    prompts: "14 prompts",
    files: "33 files",
    delta: "+516",
    minus: "-210",
    approx: "~88",
  },
  {
    title: "Design a terminal-first review flow for agent handoffs",
    author: "PR",
    authorName: "priya-r",
    prompts: "9 prompts",
    files: "11 files",
    delta: "+301",
    minus: "-77",
    approx: "~24",
  },
  {
    title: "Audit an experiment rollout and clean up product analytics",
    author: "DN",
    authorName: "devon",
    prompts: "4 prompts",
    files: "12 files",
    delta: "+190",
    minus: "-32",
    approx: "~16",
  },
];

const announcements = [
  {
    date: "March 12, 2026",
    title: "A calmer review loop",
    blurb: "Inline review summaries now group findings by risk instead of by file.",
  },
  {
    date: "March 4, 2026",
    title: "Context windows that stay readable",
    blurb: "Long sessions collapse into tidy thread snapshots without losing momentum.",
  },
  {
    date: "February 25, 2026",
    title: "Parallel plans for parallel teams",
    blurb: "Stella can split implementation work across focused helpers in one pass.",
  },
  {
    date: "February 18, 2026",
    title: "Editor handoff, without the friction",
    blurb: "Open threads move between the terminal and editor without losing state.",
  },
  {
    date: "February 7, 2026",
    title: "A cleaner install story",
    blurb: "One command now configures the CLI, shell completions, and editor links.",
  },
];

const footerGroups = [
  {
    title: "Product",
    items: ["Get Started", "Sign In", "Owner's Manual", "Models", "Stella Free"],
  },
  {
    title: "Resources",
    items: ["Chronicle", "Pricing", "Podcast", "Press Kit"],
  },
  {
    title: "Guides",
    items: ["How to Build with Agents", "Context Management"],
  },
  {
    title: "Community",
    items: ["X @stella", "Stella Insiders", "YouTube"],
  },
];

export default function Home() {
  return (
    <div className="stella-page">
      <header className="grid-shell grid-shell--dense site-header">
        <div className="brand-wrap">
          <a className="brand-mark" href="#">
            <Image
              src="/stella-logo.svg"
              alt="Stella"
              width={36}
              height={36}
              priority
            />
            <span className="brand-text">stella</span>
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
              <span>Designed</span>
              <br />
              For What&apos;s Next
            </h1>
          </div>

          <div className="hero-copy reveal reveal-delay-1">
            <p>
              Stella is the coding environment for teams that want leading models,
              fast feedback, and a calmer path from prompt to production.
            </p>
            <p className="hero-copy__subtle">
              Usage-based pricing. Thoughtful defaults. Zero markup for individuals.
            </p>
          </div>

          <HeroStellaOrb />

          <div className="hero-actions reveal reveal-delay-2">
            <a className="button button--primary" href="#">
              Start with Stella
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

        <section className="grid-shell showcase-section section-border">
          <div className="section-kicker">
            <span>Product</span>
            <h2>See Stella in motion</h2>
          </div>

          <ProductDemos />
        </section>

        <section className="grid-shell showcase-section section-border">
          <div className="section-kicker">
            <span>Social</span>
            <h2>See how people are building with Stella</h2>
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
                      <p>{card.prompts}</p>
                      <p>{card.files}</p>
                    </div>
                    <div className="showcase-card__stats">
                      <p>{card.delta}</p>
                      <p>{card.minus}</p>
                      <p>{card.approx}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid-shell news-section section-border">
          <div className="section-kicker">
            <span>News</span>
            <h2>Announcements of Stella</h2>
          </div>

          <div className="news-panel reveal">
            <div className="news-panel__header">
              <span>New</span>
              <span>GPT-5.4, the calm one</span>
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

      <footer className="grid-shell site-footer section-border">
        <div className="footer-brand">
          <a className="brand-mark brand-mark--footer" href="#">
            <Image src="/stella-logo.svg" alt="Stella" width={42} height={42} />
            <span className="brand-text">stella</span>
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
          <p>Made for teams who want agency, clarity, and a little more taste in their tools.</p>
        </div>
      </footer>
    </div>
  );
}
