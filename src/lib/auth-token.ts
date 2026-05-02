"use client";

/**
 * Fetch and cache the Convex JWT used by `ConvexProviderWithAuth` to
 * authenticate websocket queries/mutations against the Convex backend.
 * Mirrors the desktop implementation in
 * `desktop/src/global/auth/services/auth-token.ts`.
 */

import { authClient } from "./auth-client";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let inflightTokenPromise: Promise<string | null> | null = null;

const REFRESH_MARGIN_MS = 60_000;

type GetConvexTokenOptions = {
  forceRefresh?: boolean;
};

export async function getConvexToken(
  options: GetConvexTokenOptions = {},
): Promise<string | null> {
  const forceRefresh = options.forceRefresh ?? false;

  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (inflightTokenPromise) {
    return inflightTokenPromise;
  }

  if (forceRefresh) {
    cachedToken = null;
    tokenExpiresAt = 0;
  }

  inflightTokenPromise = (async () => {
    try {
      const convex = (
        authClient as unknown as {
          convex: { token(): Promise<{ data?: { token?: string } }> };
        }
      ).convex;
      const result = await convex.token();
      const token = result?.data?.token;
      if (!token) {
        cachedToken = null;
        tokenExpiresAt = 0;
        return null;
      }

      cachedToken = token;
      try {
        const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
        if (typeof payload.exp !== "number") {
          throw new Error("Missing exp claim");
        }
        tokenExpiresAt = payload.exp * 1000 - REFRESH_MARGIN_MS;
      } catch {
        tokenExpiresAt = Date.now() + 4 * 60 * 1000;
      }

      return token;
    } catch {
      cachedToken = null;
      tokenExpiresAt = 0;
      return null;
    } finally {
      inflightTokenPromise = null;
    }
  })();

  return inflightTokenPromise;
}

export function clearCachedToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
  inflightTokenPromise = null;
}
