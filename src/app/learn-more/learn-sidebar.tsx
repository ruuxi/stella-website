import Link from "next/link";

type SidebarRoute = "learn-more" | "whats-new";

type SectionLink =
  | { kind: "anchor"; label: string; anchor: string }
  | { kind: "route"; label: string; href: SidebarRoute };

const sections: SectionLink[] = [
  { kind: "anchor", label: "Overview", anchor: "#overview" },
  { kind: "anchor", label: "What Stella is", anchor: "#what-stella-is" },
  { kind: "anchor", label: "One chat", anchor: "#one-chat" },
  { kind: "anchor", label: "Capabilities", anchor: "#capabilities" },
  { kind: "anchor", label: "Access", anchor: "#access" },
  { kind: "anchor", label: "Privacy", anchor: "#privacy" },
  { kind: "anchor", label: "Models", anchor: "#models" },
  { kind: "anchor", label: "Technical notes", anchor: "#technical" },
  { kind: "route", label: "What's new", href: "whats-new" },
];

export function LearnSidebar({ current }: { current: SidebarRoute }) {
  return (
    <aside className="learn-sidebar" aria-label="Learn More sections">
      <nav>
        <p>Learn More</p>
        {sections.map((item) => {
          if (item.kind === "anchor") {
            const href =
              current === "learn-more"
                ? item.anchor
                : `/learn-more${item.anchor}`;
            return current === "learn-more" ? (
              <a key={item.anchor} href={href}>
                {item.label}
              </a>
            ) : (
              <Link key={item.anchor} href={href}>
                {item.label}
              </Link>
            );
          }
          const isCurrent = current === item.href;
          return (
            <Link
              key={item.href}
              href={`/learn-more/${item.href}`}
              aria-current={isCurrent ? "page" : undefined}
              className={isCurrent ? "learn-sidebar__active" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
