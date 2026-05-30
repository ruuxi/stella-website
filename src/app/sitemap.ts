import type { MetadataRoute } from "next";
import { MEDIA_DOCS_KINDS } from "@/lib/media-docs";
import { getSiteUrl } from "@/lib/site-url";

type Route = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

// Public, indexable HTML pages. Redirects (/changelog, /how-it-works) and
// non-indexed app pages (/billing, /sign-in, /auth/*) are intentionally omitted.
const ROUTES: Route[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/learn-more", priority: 0.8, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "weekly" },
  { path: "/store", priority: 0.7, changeFrequency: "weekly" },
  { path: "/agents", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voice", priority: 0.7, changeFrequency: "monthly" },
  { path: "/storage", priority: 0.7, changeFrequency: "monthly" },
  { path: "/memory", priority: 0.7, changeFrequency: "monthly" },
  { path: "/learn-more/whats-new", priority: 0.6, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const pages: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: new URL(route.path, base).href,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const docsEntries: MetadataRoute.Sitemap = [
    {
      url: new URL("/docs/media", base).href,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...MEDIA_DOCS_KINDS.map((kind) => ({
      url: new URL(`/docs/media/${kind}`, base).href,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  return [...pages, ...docsEntries];
}
