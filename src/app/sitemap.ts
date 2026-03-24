import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return [
    {
      url: base.href,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
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
  ];
}
