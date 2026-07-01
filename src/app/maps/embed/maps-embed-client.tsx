"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  decodeMapArtifactParam,
  type MapRouteArtifact,
} from "@/lib/maps/map-artifact";

/**
 * Client half of /maps/embed. Loads the Maps JavaScript API with the
 * referrer-restricted browser key, then draws the artifact: markers (with a
 * small place info window on tap) and, when present, the route polyline.
 * Everything is already resolved server-side — this page makes no Places or
 * Directions calls of its own.
 */

const BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY?.trim();

/* eslint-disable @typescript-eslint/no-explicit-any */
type GoogleMaps = any;

declare global {
  interface Window {
    google?: { maps?: GoogleMaps };
    __stellaMapsReady?: () => void;
  }
}

let mapsLoader: Promise<GoogleMaps> | null = null;

const loadGoogleMaps = (): Promise<GoogleMaps> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (mapsLoader) return mapsLoader;
  mapsLoader = new Promise<GoogleMaps>((resolve, reject) => {
    window.__stellaMapsReady = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("Google Maps failed to initialize."));
    };
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY ?? "",
      v: "weekly",
      libraries: "geometry",
      loading: "async",
      callback: "__stellaMapsReady",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      mapsLoader = null;
      reject(new Error("Google Maps failed to load."));
    };
    document.head.appendChild(script);
  });
  return mapsLoader;
};

/**
 * Google's standard night-mode raster styling, trimmed to the layers that
 * matter for a small card, so the dark theme card doesn't glow white.
 */
const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b95a5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a2230" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#c8d0dd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8b95a5" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c33" }],
  },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const infoWindowHtml = (marker: MapRouteArtifact["markers"][number]): string => {
  const rating =
    typeof marker.rating === "number"
      ? `<div class="maps-embed-info-rating">★ ${marker.rating.toFixed(1)}${
          typeof marker.ratingCount === "number"
            ? ` <span>(${marker.ratingCount.toLocaleString()})</span>`
            : ""
        }</div>`
      : "";
  const address = marker.address
    ? `<div class="maps-embed-info-address">${escapeHtml(marker.address)}</div>`
    : "";
  return `<div class="maps-embed-info"><div class="maps-embed-info-name">${escapeHtml(
    marker.name,
  )}</div>${rating}${address}</div>`;
};

const renderArtifact = (
  maps: GoogleMaps,
  container: HTMLElement,
  artifact: MapRouteArtifact,
  dark: boolean,
) => {
  const map = new maps.Map(container, {
    center: { lat: artifact.markers[0].lat, lng: artifact.markers[0].lng },
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: "cooperative",
    clickableIcons: false,
    ...(dark ? { styles: DARK_MAP_STYLES } : {}),
  });

  const bounds = new maps.LatLngBounds();
  const infoWindow = new maps.InfoWindow();
  const routeLabels: Record<string, string> = {
    origin: "A",
    destination: "B",
  };
  for (const marker of artifact.markers) {
    const position = { lat: marker.lat, lng: marker.lng };
    bounds.extend(position);
    const label = marker.role ? routeLabels[marker.role] : undefined;
    const pin = new maps.Marker({
      map,
      position,
      title: marker.name,
      ...(label
        ? { label: { text: label, color: "#ffffff", fontSize: "12px" } }
        : {}),
    });
    pin.addListener("click", () => {
      infoWindow.setContent(infoWindowHtml(marker));
      infoWindow.open({ map, anchor: pin });
    });
  }

  if (artifact.route) {
    try {
      const path = maps.geometry.encoding.decodePath(artifact.route.polyline);
      for (const point of path) bounds.extend(point);
      new maps.Polyline({
        map,
        path,
        strokeColor: dark ? "#7aa5ff" : "#1a73e8",
        strokeOpacity: 0.9,
        strokeWeight: 5,
      });
    } catch {
      // A bad polyline still leaves a useful pins-only map.
    }
  }

  if (artifact.markers.length === 1 && !artifact.route) {
    map.setCenter(bounds.getCenter());
    map.setZoom(15);
  } else {
    map.fitBounds(bounds, 48);
    // Never over-zoom tight clusters (two pins on one block).
    maps.event.addListenerOnce(map, "idle", () => {
      if ((map.getZoom() ?? 0) > 16) map.setZoom(16);
    });
  }
};

export function MapsEmbedClient() {
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = params.get("d");
  const dark = params.get("mode") === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const artifact = decodeMapArtifactParam(payload);
    if (!artifact) {
      setError("This map link is missing its location data.");
      return;
    }
    if (!BROWSER_KEY) {
      setError("Maps are not configured on this server.");
      return;
    }
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;
        setError(null);
        renderArtifact(maps, container, artifact, dark);
      })
      .catch(() => {
        if (!cancelled) setError("The map could not be loaded.");
      });
    return () => {
      cancelled = true;
      // Google Maps has no destroy API; dropping the DOM subtree is the
      // documented teardown for an embedded map this small.
      container.replaceChildren();
    };
  }, [payload, dark]);

  return (
    <div className="maps-embed-root" data-mode={dark ? "dark" : "light"}>
      <div ref={containerRef} className="maps-embed-map" />
      {error ? (
        <div className="maps-embed-error" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
