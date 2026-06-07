import type { Metadata } from "next";
import {
  changelogEntries,
  type ChangeItem,
  type ChangelogEntry,
} from "../changelog-entries";
import { LearnSidebar } from "../learn-sidebar";

export const metadata: Metadata = {
  title: "What's New",
  description:
    "Every Stella release, in plain English. Each version's highlights up top, the rest tucked just below.",
  alternates: { canonical: "/learn-more/whats-new" },
};

function entryKey(entry: ChangelogEntry): string {
  return `${entry.release ?? entry.era ?? "entry"}-${entry.date}`;
}

function entryHeadline(entry: ChangelogEntry): string {
  return entry.release ?? entry.era ?? entry.date;
}

function ChangeRow({ item }: { item: ChangeItem }) {
  if (typeof item === "string") {
    return <li>{item}</li>;
  }
  return (
    <li>
      <span className="learn-log__product" aria-label={`${item.product} update`}>
        {item.product}
      </span>
      {item.text}
    </li>
  );
}

export default function WhatsNew() {
  return (
    <main className="learn-shell">
      <LearnSidebar current="whats-new" />

      <article className="learn-content">
        <header className="learn-hero learn-hero--compact">
          <div className="learn-hero__copy">
            <span className="learn-eyebrow">What&apos;s new</span>
            <h1>
              Every release,{" "}
              <span className="learn-hero__accent">in plain English</span>.
            </h1>
            <p>
              Stella ships in small, frequent releases. Each entry below
              headlines the version that shipped, with the highlights up top
              and the rest tucked just behind &ldquo;More in this release.&rdquo;
            </p>
          </div>
        </header>

        <section className="learn-section learn-section--log">
          <ol className="learn-log">
            {changelogEntries.map((entry) => {
              const highlights = entry.highlights ?? [];
              const more = entry.more ?? [];
              const moreCount = more.length;
              return (
                <li key={entryKey(entry)} className="learn-log__entry">
                  <div className="learn-log__meta">
                    <span className="learn-log__release">
                      {entryHeadline(entry)}
                    </span>
                    {entry.release ? (
                      <span className="learn-log__date">{entry.date}</span>
                    ) : (
                      <span className="learn-log__date learn-log__date--era">
                        {entry.date}
                      </span>
                    )}
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
                    {highlights.length > 0 ? (
                      <ul className="learn-log__items">
                        {highlights.map((item, idx) => (
                          <ChangeRow key={`h-${idx}`} item={item} />
                        ))}
                      </ul>
                    ) : null}
                    {moreCount > 0 ? (
                      <details className="learn-log__more">
                        <summary>
                          <span className="learn-log__more-label">
                            More in this release
                          </span>
                          <span className="learn-log__more-count">
                            {moreCount}
                          </span>
                        </summary>
                        <ul className="learn-log__items learn-log__items--more">
                          {more.map((item, idx) => (
                            <ChangeRow key={`m-${idx}`} item={item} />
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </article>
    </main>
  );
}
