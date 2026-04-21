import { renderMediaDocsOverview } from "@/lib/media-docs";

const PLAIN_TEXT_HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  // Cache aggressively at the edge but allow on-demand revalidation when we ship updates.
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderMediaDocsOverview(), {
    status: 200,
    headers: PLAIN_TEXT_HEADERS,
  });
}
