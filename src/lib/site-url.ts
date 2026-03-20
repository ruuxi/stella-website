const PUBLIC_SITE = "https://stella.sh";

/** Canonical site URL for metadata, sitemap, and robots. */
export function getSiteUrl(): URL {
  if (process.env.NODE_ENV !== "production") {
    return new URL("http://localhost:3000");
  }
  return new URL(`${PUBLIC_SITE}/`);
}
