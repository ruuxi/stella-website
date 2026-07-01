import type { Metadata } from "next";
import { Suspense } from "react";
import { MapsEmbedClient } from "./maps-embed-client";
import "./maps-embed.css";

/**
 * /maps/embed — the hosted interactive map behind Stella's inline chat map
 * cards (desktop iframe + mobile WebView). Renders a Google Map from the
 * `map-route` artifact passed via the `?d=` query param (base64url JSON);
 * see `src/lib/maps/map-artifact.ts` for the payload and
 * `/api/maps/resolve` for how it gets produced.
 *
 * The Google browser key used here is HTTP-referrer-restricted to stella.sh
 * (+ localhost for dev) and only allows the Maps JavaScript API, so shipping
 * it in this page's bundle is safe by design.
 */

export const metadata: Metadata = {
  title: "Map",
  robots: { index: false, follow: false },
};

export default function MapsEmbedPage() {
  return (
    <Suspense fallback={<div className="maps-embed-fallback" />}>
      <MapsEmbedClient />
    </Suspense>
  );
}
