import type { Metadata } from "next";
import { changelogEntries } from "../changelog-entries";
import { LearnSidebar } from "../learn-sidebar";

export const metadata: Metadata = {
  title: "What's New",
  description:
    "A running log of what's shipped in Stella, day by day. New features and fixes, in plain English.",
  alternates: { canonical: "/learn-more/whats-new" },
};

export default function WhatsNew() {
  return (
    <main className="learn-shell">
      <LearnSidebar current="whats-new" />

      <article className="learn-content">
        <header className="learn-hero learn-hero--compact">
          <div className="learn-hero__copy">
            <span className="learn-eyebrow">What&apos;s new</span>
            <h1>
              Every change,{" "}
              <span className="learn-hero__accent">newest first</span>.
            </h1>
            <p>
              A running log of what&apos;s shipped in Stella, in plain English.
              New features and fixes, day by day.
            </p>
          </div>
        </header>

        <section className="learn-section learn-section--log">
          <ol className="learn-log">
            {changelogEntries.map((entry) => (
              <li key={entry.date} className="learn-log__entry">
                <div className="learn-log__meta">
                  <span className="learn-log__date">{entry.date}</span>
                  {entry.tags && entry.tags.length > 0 ? (
                    <div className="learn-log__tags">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="learn-log__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="learn-log__body">
                  {entry.features && entry.features.length > 0 ? (
                    <div className="learn-log__group">
                      <h2 className="learn-log__group-label">New</h2>
                      <ul className="learn-log__items">
                        {entry.features.map((item, idx) => (
                          <li key={`f-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {entry.fixes && entry.fixes.length > 0 ? (
                    <div className="learn-log__group">
                      <h2 className="learn-log__group-label">
                        Fixes &amp; polish
                      </h2>
                      <ul className="learn-log__items">
                        {entry.fixes.map((item, idx) => (
                          <li key={`x-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {entry.items && entry.items.length > 0 ? (
                    <ul className="learn-log__items">
                      {entry.items.map((item, idx) => (
                        <li key={`i-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </main>
  );
}
