import { renderLlmsTxt } from "@/lib/agent-pages";

const HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control":
    "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLlmsTxt(), { status: 200, headers: HEADERS });
}
