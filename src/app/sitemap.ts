import type { MetadataRoute } from "next";
import { MEDIA_DOCS_KINDS } from "@/lib/media-docs";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
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
  return [
    {
      url: base.href,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/how-it-works", base).href,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: new URL("/pricing", base).href,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: new URL("/privacy", base).href,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: new URL("/terms", base).href,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...docsEntries,
  ];
}
