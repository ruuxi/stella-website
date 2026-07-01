import { NextResponse } from "next/server";
import type {
  MapArtifactMarker,
  MapArtifactRoute,
  MapArtifactRouteStep,
  MapRouteArtifact,
  MapTravelMode,
} from "@/lib/maps/map-artifact";

/**
 * POST /api/maps/resolve — resolve natural map inputs into a `map-route`
 * artifact for Stella's inline chat map cards.
 *
 * Called by the Stella runtime's `map` tool (desktop app). The Google server
 * key (`GOOGLE_MAPS_SERVER_API_KEY`, API-restricted to Places / Directions /
 * Geocoding) lives only here — clients never see a key; the embed page uses a
 * separate referrer-restricted browser key for rendering.
 *
 * Body:
 *   {
 *     places?: string[];          // 1–8 natural queries to pin
 *     origin?: string;            // route endpoints (both or neither)
 *     destination?: string;
 *     mode?: "driving" | "walking" | "cycling" | "transit";
 *     title?: string;
 *   }
 *
 * Returns { map: MapRouteArtifact, unresolved: string[] } or
 * { error: string } with a 4xx/5xx status. Best-effort by design: partial
 * place resolution succeeds with the misses listed in `unresolved`; a failed
 * route is an error (a route card without a route is useless).
 */

export const runtime = "nodejs";

const MAX_PLACES = 8;
const MAX_ROUTE_STEPS = 20;
const GOOGLE_TIMEOUT_MS = 12_000;

const TRAVEL_MODES = new Set<MapTravelMode>([
  "driving",
  "walking",
  "cycling",
  "transit",
]);

/** Google Directions uses "bicycling"; the artifact keeps "cycling". */
const DIRECTIONS_MODE: Record<MapTravelMode, string> = {
  driving: "driving",
  walking: "walking",
  cycling: "bicycling",
  transit: "transit",
};

type ResolveRequest = {
  places?: string[];
  origin?: string;
  destination?: string;
  mode?: MapTravelMode;
  title?: string;
};

const asTrimmedString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const parseBody = (raw: unknown): ResolveRequest | string => {
  if (!raw || typeof raw !== "object") return "Request body must be JSON.";
  const body = raw as Record<string, unknown>;
  const places = Array.isArray(body.places)
    ? body.places.map(asTrimmedString).filter((entry) => entry.length > 0)
    : [];
  const origin = asTrimmedString(body.origin);
  const destination = asTrimmedString(body.destination);
  if ((origin && !destination) || (!origin && destination)) {
    return "Provide both origin and destination for a route, or neither.";
  }
  if (places.length === 0 && !origin) {
    return "Provide places to pin and/or an origin + destination route.";
  }
  if (places.length > MAX_PLACES) {
    return `At most ${MAX_PLACES} places per map.`;
  }
  const modeRaw = asTrimmedString(body.mode).toLowerCase();
  const mode = TRAVEL_MODES.has(modeRaw as MapTravelMode)
    ? (modeRaw as MapTravelMode)
    : "driving";
  const title = asTrimmedString(body.title);
  return {
    places,
    ...(origin ? { origin, destination } : {}),
    mode,
    ...(title ? { title } : {}),
  };
};

const fetchGoogle = async (input: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GOOGLE_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

type ResolvedPlace = {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  rating?: number;
  ratingCount?: number;
};

/** Places API (New) text search, first hit only. Null when nothing matched. */
const resolvePlace = async (
  query: string,
  apiKey: string,
): Promise<ResolvedPlace | null> => {
  const response = await fetchGoogle(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery: query, pageSize: 1 }),
    },
  );
  if (!response.ok) {
    throw new Error(`Places search failed (${response.status}).`);
  }
  const data = (await response.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
      rating?: number;
      userRatingCount?: number;
    }>;
  };
  const place = data.places?.[0];
  const lat = place?.location?.latitude;
  const lng = place?.location?.longitude;
  if (!place || typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }
  return {
    name: place.displayName?.text?.trim() || query,
    lat,
    lng,
    ...(place.formattedAddress ? { address: place.formattedAddress } : {}),
    ...(place.id ? { placeId: place.id } : {}),
    ...(typeof place.rating === "number" ? { rating: place.rating } : {}),
    ...(typeof place.userRatingCount === "number"
      ? { ratingCount: place.userRatingCount }
      : {}),
  };
};

const stripHtml = (html: string): string =>
  html
    .replace(/<div[^>]*>/gi, " — ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

type ResolvedRoute = {
  origin: MapArtifactMarker;
  destination: MapArtifactMarker;
  route: MapArtifactRoute;
};

/**
 * Directions API with free-text endpoints (Google geocodes them internally,
 * so a route costs one call). Endpoint markers come from the leg.
 */
const resolveRoute = async (
  originQuery: string,
  destinationQuery: string,
  mode: MapTravelMode,
  apiKey: string,
): Promise<ResolvedRoute | string> => {
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", originQuery);
  url.searchParams.set("destination", destinationQuery);
  url.searchParams.set("mode", DIRECTIONS_MODE[mode]);
  url.searchParams.set("key", apiKey);
  const response = await fetchGoogle(url.toString());
  if (!response.ok) {
    return `Directions lookup failed (${response.status}).`;
  }
  const data = (await response.json()) as {
    status?: string;
    error_message?: string;
    routes?: Array<{
      summary?: string;
      overview_polyline?: { points?: string };
      legs?: Array<{
        distance?: { value?: number };
        duration?: { value?: number };
        start_address?: string;
        end_address?: string;
        start_location?: { lat?: number; lng?: number };
        end_location?: { lat?: number; lng?: number };
        steps?: Array<{
          html_instructions?: string;
          distance?: { value?: number };
        }>;
      }>;
    }>;
  };
  if (data.status === "ZERO_RESULTS") {
    return `No ${mode} route found between "${originQuery}" and "${destinationQuery}".`;
  }
  if (data.status !== "OK") {
    return data.error_message
      ? `Directions lookup failed: ${data.error_message}`
      : `Directions lookup failed (${data.status ?? "no status"}).`;
  }
  const route = data.routes?.[0];
  const leg = route?.legs?.[0];
  const polyline = route?.overview_polyline?.points;
  if (
    !route ||
    !leg ||
    !polyline ||
    typeof leg.start_location?.lat !== "number" ||
    typeof leg.start_location?.lng !== "number" ||
    typeof leg.end_location?.lat !== "number" ||
    typeof leg.end_location?.lng !== "number"
  ) {
    return "Directions lookup returned an unusable route.";
  }
  const steps: MapArtifactRouteStep[] = (leg.steps ?? [])
    .slice(0, MAX_ROUTE_STEPS)
    .map((step) => ({
      instruction: stripHtml(step.html_instructions ?? ""),
      distanceMeters: step.distance?.value ?? 0,
    }))
    .filter((step) => step.instruction.length > 0);
  return {
    origin: {
      id: "origin",
      name: originQuery,
      lat: leg.start_location.lat,
      lng: leg.start_location.lng,
      ...(leg.start_address ? { address: leg.start_address } : {}),
      role: "origin",
    },
    destination: {
      id: "destination",
      name: destinationQuery,
      lat: leg.end_location.lat,
      lng: leg.end_location.lng,
      ...(leg.end_address ? { address: leg.end_address } : {}),
      role: "destination",
    },
    route: {
      mode,
      originId: "origin",
      destinationId: "destination",
      distanceMeters: leg.distance?.value ?? 0,
      durationSeconds: leg.duration?.value ?? 0,
      ...(route.summary ? { summary: route.summary } : {}),
      polyline,
      ...(steps.length > 0 ? { steps } : {}),
    },
  };
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Maps resolution is not configured on this server." },
      { status: 503 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 },
    );
  }
  const parsed = parseBody(rawBody);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const markers: MapArtifactMarker[] = [];
    let route: MapArtifactRoute | undefined;
    const unresolved: string[] = [];

    if (parsed.origin && parsed.destination) {
      const resolved = await resolveRoute(
        parsed.origin,
        parsed.destination,
        parsed.mode ?? "driving",
        apiKey,
      );
      if (typeof resolved === "string") {
        return NextResponse.json({ error: resolved }, { status: 422 });
      }
      markers.push(resolved.origin, resolved.destination);
      route = resolved.route;
    }

    // Sequential on purpose: chat-scale payloads (≤8 queries) and it keeps
    // the request pattern gentle on quota.
    for (const [index, query] of (parsed.places ?? []).entries()) {
      const place = await resolvePlace(query, apiKey);
      if (!place) {
        unresolved.push(query);
        continue;
      }
      markers.push({
        id: `p${index + 1}`,
        role: "place",
        ...place,
      });
    }

    if (markers.length === 0) {
      return NextResponse.json(
        {
          error:
            unresolved.length > 0
              ? `Could not find: ${unresolved.join("; ")}.`
              : "Nothing could be resolved for this map.",
        },
        { status: 422 },
      );
    }

    const map: MapRouteArtifact = {
      kind: "map-route",
      version: 1,
      ...(parsed.title ? { title: parsed.title } : {}),
      markers,
      ...(route ? { route } : {}),
    };
    return NextResponse.json({ map, unresolved });
  } catch (error) {
    return NextResponse.json(
      { error: `Map resolution failed: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}
