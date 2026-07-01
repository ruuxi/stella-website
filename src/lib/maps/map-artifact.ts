/**
 * `map-route` artifact — the renderer-agnostic payload behind Stella's inline
 * chat map cards.
 *
 * The canonical producer is the Stella runtime's `map` tool: it POSTs natural
 * inputs (place queries, origin → destination) to `/api/maps/resolve` on this
 * site, which resolves them through Google Places / Directions using the
 * server-side key and returns this artifact. Renderers (the desktop chat card,
 * the mobile chat card) then embed `/maps/embed?d=<encoded artifact>` — a page
 * that draws the interactive Google Map with the referrer-restricted browser
 * key. The same shape is mirrored in the Stella desktop repo
 * (`runtime/contracts/map-artifact.ts`) and the mobile repo; keep them in
 * sync.
 */

export type MapTravelMode = "driving" | "walking" | "cycling" | "transit";

export type MapArtifactMarker = {
  /** Stable id within the artifact (e.g. "m1", "origin"). */
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  /** Google place id when the marker came from Places resolution. */
  placeId?: string;
  /** Google rating (1–5) when available. */
  rating?: number;
  ratingCount?: number;
  role?: "origin" | "destination" | "place";
};

export type MapArtifactRouteStep = {
  instruction: string;
  distanceMeters: number;
};

export type MapArtifactRoute = {
  mode: MapTravelMode;
  /** Marker ids for the endpoints. */
  originId: string;
  destinationId: string;
  distanceMeters: number;
  durationSeconds: number;
  /** Human route summary, e.g. "via US-101 N". */
  summary?: string;
  /** Google encoded overview polyline. */
  polyline: string;
  /** Plain-text turn summary (capped); not required to draw the map. */
  steps?: MapArtifactRouteStep[];
};

export type MapRouteArtifact = {
  kind: "map-route";
  version: 1;
  title?: string;
  markers: MapArtifactMarker[];
  route?: MapArtifactRoute;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isMarker = (value: unknown): value is MapArtifactMarker => {
  if (!value || typeof value !== "object") return false;
  const marker = value as Record<string, unknown>;
  return (
    typeof marker.id === "string" &&
    typeof marker.name === "string" &&
    isFiniteNumber(marker.lat) &&
    isFiniteNumber(marker.lng)
  );
};

export const isMapRouteArtifact = (
  value: unknown,
): value is MapRouteArtifact => {
  if (!value || typeof value !== "object") return false;
  const artifact = value as Record<string, unknown>;
  if (artifact.kind !== "map-route") return false;
  if (!Array.isArray(artifact.markers) || artifact.markers.length === 0) {
    return false;
  }
  if (!artifact.markers.every(isMarker)) return false;
  const route = artifact.route;
  if (route !== undefined) {
    if (!route || typeof route !== "object") return false;
    const r = route as Record<string, unknown>;
    if (typeof r.polyline !== "string" || r.polyline.length === 0) return false;
    if (!isFiniteNumber(r.distanceMeters) || !isFiniteNumber(r.durationSeconds))
      return false;
  }
  return true;
};

/**
 * Decode the `?d=` embed param (base64url JSON) back into an artifact.
 * Returns null for anything malformed — the embed page shows a quiet
 * fallback instead of a broken map.
 */
export const decodeMapArtifactParam = (
  param: string | null | undefined,
): MapRouteArtifact | null => {
  if (!param) return null;
  try {
    const base64 = param.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    return isMapRouteArtifact(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
