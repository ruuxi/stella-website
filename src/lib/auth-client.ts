"use client";

import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";
import { readConvexSiteUrl } from "./convex-urls";

/**
 * Web-side Better Auth client. Mirrors `desktop/src/global/auth/lib/auth-client.ts`
 * minus the anonymous plugin — the public site stays unauthenticated by default.
 *
 * - `crossDomainClient()` persists the session cookie in localStorage under
 *   `better-auth_cookie` so the browser can authenticate against the Convex
 *   site domain (which lives on `*.convex.site`, not `stella.sh`).
 * - `convexClient()` exposes `authClient.convex.token()` which returns the
 *   short-lived JWT that `ConvexProviderWithAuth` hands to the Convex client.
 */
const plugins = [convexClient(), crossDomainClient(), magicLinkClient()];

type WebAuthClient = ReturnType<typeof createAuthClient<{ plugins: typeof plugins }>>;

let _instance: WebAuthClient | null = null;

export const authClient = new Proxy({} as WebAuthClient, {
  get(_target, prop, receiver) {
    if (!_instance) {
      _instance = createAuthClient({
        baseURL: readConvexSiteUrl(),
        plugins,
        sessionOptions: {
          refetchOnWindowFocus: false,
        },
      });
    }
    return Reflect.get(_instance, prop, receiver);
  },
});
