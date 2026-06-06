// Mirrors the /how-it-works → /learn-more redirect for the markdown variant.
export const dynamic = "force-static";

export function GET(): Response {
  return Response.redirect(new URL("/learn-more.md", "https://stella.sh"), 308);
}
