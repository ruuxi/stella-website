import { AGENT_PAGES, markdownResponse } from "@/lib/agent-pages";

const page = AGENT_PAGES.find((p) => p.mdPath === "/learn-more.md")!;

export const dynamic = "force-static";

export function GET(): Response {
  return markdownResponse(page.markdown);
}
