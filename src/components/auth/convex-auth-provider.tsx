"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { clearCachedToken, getConvexToken } from "@/lib/auth-token";
import { getConvexClient } from "@/lib/convex-client";
import { isConvexConfigured } from "@/lib/convex-urls";

function useWebsiteConvexAuth() {
  const session = authClient.useSession();
  const [desktopAuthState, setDesktopAuthState] = useState<
    "checking" | "unavailable" | "signed-in" | "signed-out"
  >("checking");

  const sessionUserId =
    (session.data as { user?: { id?: string } } | null | undefined)?.user?.id ??
    null;

  useEffect(() => {
    const bridge = window as Window & {
      stellaDesktopStore?: { getAuthToken?: () => Promise<string | null> };
    };
    const getDesktopToken = bridge.stellaDesktopStore?.getAuthToken;
    if (typeof getDesktopToken !== "function") {
      setDesktopAuthState("unavailable");
      return;
    }
    let cancelled = false;
    void getDesktopToken()
      .then((token) => {
        if (!cancelled) {
          setDesktopAuthState(token ? "signed-in" : "signed-out");
        }
      })
      .catch(() => {
        if (!cancelled) setDesktopAuthState("signed-out");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    clearCachedToken();
  }, [desktopAuthState, sessionUserId]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken = false }: { forceRefreshToken?: boolean } = {}) => {
      const bridge = window as Window & {
        stellaDesktopStore?: { getAuthToken?: () => Promise<string | null> };
      };
      const desktopToken = await bridge.stellaDesktopStore?.getAuthToken?.();
      if (desktopToken) {
        return desktopToken;
      }
      return await getConvexToken({ forceRefresh: forceRefreshToken });
    },
    // Re-mount on identity change so ConvexProviderWithAuth re-runs setAuth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionUserId],
  );

  return useMemo(
    () => ({
      isLoading:
        desktopAuthState === "checking" ||
        (Boolean(session.isPending) && desktopAuthState !== "signed-in"),
      isAuthenticated: desktopAuthState === "signed-in" || Boolean(session.data),
      fetchAccessToken,
    }),
    [desktopAuthState, fetchAccessToken, session.data, session.isPending],
  );
}

export function ConvexAuthProvider({ children }: { children: ReactNode }) {
  // The marketing site can render without Convex configured (e.g. preview
  // builds without env vars). Sign-in and account UI guard separately.
  if (!isConvexConfigured()) {
    return <>{children}</>;
  }
  return (
    <ConvexProviderWithAuth client={getConvexClient()} useAuth={useWebsiteConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
