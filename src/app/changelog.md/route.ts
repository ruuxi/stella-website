// Mirrors the /changelog → /learn-more/whats-new redirect for the markdown variant.
export const dynamic = "force-static";

export function GET(): Response {
  return Response.redirect(
    new URL("/learn-more/whats-new.md", "https://stella.sh"),
    308,
  );
}
