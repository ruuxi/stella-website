import dynamic from "next/dynamic";
import Image from "next/image";
import { DownloadButton } from "@/components/download-button";
import { HeroStellaOrb } from "@/components/hero-stella-orb-dynamic";
import { DeferInView } from "@/components/product-demos/defer-in-view";

const SelfModHero = dynamic(
  () => import("@/components/product-demos/self-mod-hero").then((mod) => mod.SelfModHero),
  { loading: () => <div className="self-mod-hero self-mod-hero--placeholder" /> },
);

const RadialDialSection = dynamic(
  () => import("@/components/product-demos/demo-sections").then((mod) => mod.RadialDialSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const CanvasSection = dynamic(
  () => import("@/components/product-demos/demo-sections").then((mod) => mod.CanvasSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const MobileSection = dynamic(
  () => import("@/components/product-demos/demo-sections").then((mod) => mod.MobileSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const MemorySection = dynamic(
  () => import("@/components/product-demos/onboarding-derived-sections").then((mod) => mod.MemorySection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const ActionsSection = dynamic(
  () => import("@/components/product-demos/onboarding-derived-sections").then((mod) => mod.ActionsSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const TogetherSection = dynamic(
  () => import("@/components/product-demos/onboarding-derived-sections").then((mod) => mod.TogetherSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const VoiceSection = dynamic(
  () => import("@/components/product-demos/onboarding-derived-sections").then((mod) => mod.VoiceSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const ExtensionSection = dynamic(
  () => import("@/components/product-demos/onboarding-derived-sections").then((mod) => mod.ExtensionSection),
  { loading: () => <div className="demo-panel" style={{ minHeight: "clamp(14rem, 38vw, 26rem)" }} /> },
);

const navItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "What's New", href: "/changelog" },
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
        <section className="grid-shell hero-section section-border">
          <div className="hero-title reveal">
            <h1>
              <span>Your Personal</span> AI Assistant
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

          <div className="hero-actions reveal reveal-delay-2">
            <HeroStellaOrb />
            <DownloadButton />
          </div>
        </section>

        <DeferInView
          fallback={<div className="self-mod-hero self-mod-hero--placeholder" />}
          rootMargin="480px 0px"
        >
          <SelfModHero />
        </DeferInView>

        <section className="privacy-hero" data-reveal>
          <header
            className="privacy-hero__copy"
            data-reveal-child
            style={{ ["--reveal-index" as string]: 0 }}
          >
            <span className="privacy-hero__eyebrow">Private</span>
            <h2 className="privacy-hero__title">Your stuff stays yours.</h2>
            <p className="privacy-hero__lede">
              Stella runs on your computer, with your files. We don&apos;t keep
              your conversations or your work on our servers, and you&apos;re
              free to use whichever model you like — or read the code and see
              exactly how it all fits together.
            </p>
          </header>

          <div
            className="privacy-hero__grid"
            data-reveal-child
            style={{ ["--reveal-index" as string]: 1 }}
          >
            <article className="privacy-card">
              <span className="privacy-card__label">Local</span>
              <h3 className="privacy-card__title">Nothing on our servers</h3>
              <p className="privacy-card__body">
                Your files, chats, and memories live on your computer. We
                don&apos;t hold onto them, and we can&apos;t see them.
              </p>
            </article>

            <article className="privacy-card">
              <a
                className="privacy-card__github"
                href="https://github.com/ruuxi/stella"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Stella on GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="currentColor"
                    d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.96 3.22 9.16 7.69 10.65.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.34-3.79-1.34-.51-1.31-1.25-1.66-1.25-1.66-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.99 0 0 .95-.3 3.1 1.15.9-.25 1.86-.37 2.82-.38.96.01 1.92.13 2.82.38 2.15-1.45 3.1-1.15 3.1-1.15.61 1.56.23 2.7.11 2.99.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.4.34.76 1.02.76 2.06v3.05c0 .3.21.65.78.54 4.46-1.49 7.68-5.69 7.68-10.65C23.25 5.48 18.27.5 12 .5Z"
                  />
                </svg>
              </a>
              <span className="privacy-card__label">Open</span>
              <h3 className="privacy-card__title">Open source, all of it</h3>
              <p className="privacy-card__body">
                Every line of Stella is on GitHub. Read it, fork it, or change
                it to suit how you work.
              </p>
            </article>

            <article className="privacy-card">
              <span className="privacy-card__label">Yours to choose</span>
              <h3 className="privacy-card__title">Bring any model</h3>
              <p className="privacy-card__body">
                Use GPT, Claude, Gemini, or a model running on your own
                machine. Switch whenever you want — Stella works with all of
                them.
              </p>
            </article>
          </div>
        </section>

        <RadialDialSection />

        <CanvasSection />

        <ActionsSection />

        <VoiceSection />

        <MobileSection />

        <MemorySection />

        <TogetherSection />

        <ExtensionSection />

        <section
          className="grid-shell showcase-section showcase-section--deferred section-border"
          data-reveal
        >
          <div className="section-kicker" data-reveal-child style={{ ["--reveal-index" as string]: 0 }}>
            <span>People</span>
            <h2>See how people use Stella every day</h2>
          </div>

          <div className="showcase-grid">
            {showcaseCards.map((card, index) => (
              <article
                key={card.title}
                className="showcase-card"
                data-reveal-child
                style={{ ["--reveal-index" as string]: index + 1 }}
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

        <section
          className="grid-shell news-section section-deferred-render section-border"
          data-reveal
        >
          <div className="section-kicker" data-reveal-child style={{ ["--reveal-index" as string]: 0 }}>
            <span>More</span>
            <h2>Additional features</h2>
          </div>

          <div className="news-panel" data-reveal-child style={{ ["--reveal-index" as string]: 1 }}>
            <div className="news-list">
              {features.map((item, index) => (
                <div
                  key={item.title}
                  className="news-item"
                  data-reveal-child
                  style={{ ["--reveal-index" as string]: index + 2 }}
                >
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
