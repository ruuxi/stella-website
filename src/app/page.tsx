import dynamic from "next/dynamic";
import Image from "next/image";
import { DownloadButton } from "@/components/download-button";
import { HeroMorphTitle } from "@/components/hero-morph-title";
import { HeroStellaOrb } from "@/components/hero-stella-orb-dynamic";
import { SiteHeader } from "@/components/site-header";

const HomeStoryGrid = dynamic(
  () =>
    import("@/components/home-story/HomeStoryGrid").then(
      (mod) => mod.HomeStoryGrid,
    ),
  {
    loading: () => (
      <div
        className="home-story"
        style={{ minHeight: "60vh" }}
        aria-hidden="true"
      />
    ),
  },
);

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
    title: "Browser extension",
    blurb: "Stella rides along in Chrome, ready to read or act on the page you're on.",
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
    title: "Wake word",
    blurb: "Say \"Stella\" and start talking. No buttons, no typing needed.",
  },
  {
    title: "Automate your routine",
    blurb: "Set up daily check-ins, reminders, and recurring tasks in plain English.",
  },
  {
    title: "Manage your files",
    blurb: "Search, organize, read, and edit files on your computer.",
  },
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

export default function Home() {
  return (
    <div className="stella-page">
      <SiteHeader />

      <main>
        <section className="grid-shell hero-section section-border">
          <div className="hero-stack">
            <div className="hero-stack__orb">
              <HeroStellaOrb />
            </div>
            <div className="hero-stack__title reveal">
              <HeroMorphTitle />
            </div>
            <div className="hero-stack__sub reveal reveal-delay-1">
              <p>Private. Open source. Lives on your computer.</p>
            </div>
            <div className="hero-stack__cta reveal reveal-delay-2">
              <DownloadButton />
              <p className="hero-research-note">
                Stella is in research preview
              </p>
            </div>
          </div>
        </section>

        <HomeStoryGrid />

        <section
          className="grid-shell showcase-section showcase-section--deferred section-border"
          data-reveal
        >
          <div
            className="section-kicker"
            data-reveal-child
            style={{ ["--reveal-index" as string]: 0 }}
          >
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
                <a
                  className="showcase-card__link"
                  href="#"
                  aria-label={card.title}
                />

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
          <div
            className="section-kicker"
            data-reveal-child
            style={{ ["--reveal-index" as string]: 0 }}
          >
            <span>More</span>
            <h2>Additional features</h2>
          </div>

          <div
            className="news-panel"
            data-reveal-child
            style={{ ["--reveal-index" as string]: 1 }}
          >
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
          <a className="brand-mark brand-mark--footer" href="/">
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
