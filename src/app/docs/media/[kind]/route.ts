import { notFound } from "next/navigation";
import {
  MEDIA_DOCS_KINDS,
  parseMediaDocsKind,
  renderMediaDocsForKind,
} from "@/lib/media-docs";

const PLAIN_TEXT_HEADERS: HeadersInit = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): Array<{ kind: string }> {
  return MEDIA_DOCS_KINDS.map((kind) => ({ kind }));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> },
): Promise<Response> {
  const { kind } = await context.params;
  const parsed = parseMediaDocsKind(kind);
  if (!parsed) {
    notFound();
  }
  return new Response(renderMediaDocsForKind(parsed), {
    status: 200,
    headers: PLAIN_TEXT_HEADERS,
  });
}
