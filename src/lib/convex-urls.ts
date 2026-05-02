/**
 * Resolve the Convex deployment URL (HTTPS API) and Convex site URL
 * (used as the Better Auth `baseURL`). The Convex CLI emits both during
 * deploy, but for the public website we only ship them as `NEXT_PUBLIC_*`
 * env vars so the values are inlined into the browser bundle.
 *
 * We keep a small inference helper so that, if the site URL is omitted in
 * dev, we can derive it from the deployment URL by swapping `.convex.cloud`
 * for `.convex.site`.
 */

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const tryReadConvexDeploymentUrl = (): string | null => {
  const raw = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
  if (!raw) return null;
  return trimTrailingSlash(raw);
};

export const readConvexDeploymentUrl = (): string => {
  const url = tryReadConvexDeploymentUrl();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Add it to .env.local before signing in.",
    );
  }
  return url;
};

export const tryReadConvexSiteUrl = (): string | null => {
  const explicit = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (explicit) {
    return trimTrailingSlash(explicit);
  }

  const deployment = tryReadConvexDeploymentUrl();
  if (deployment && deployment.endsWith(".convex.cloud")) {
    return `${deployment.slice(0, -".convex.cloud".length)}.convex.site`;
  }
  return null;
};

export const readConvexSiteUrl = (): string => {
  const url = tryReadConvexSiteUrl();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_SITE_URL is not set and could not be inferred from NEXT_PUBLIC_CONVEX_URL.",
    );
  }
  return url;
};

/** True when both Convex URLs are configured. Used to gate the auth provider. */
export const isConvexConfigured = (): boolean => {
  return tryReadConvexDeploymentUrl() !== null && tryReadConvexSiteUrl() !== null;
};
