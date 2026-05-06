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
  const [desktopAuthAvailable, setDesktopAuthAvailable] = useState(false);

  const sessionUserId =
    (session.data as { user?: { id?: string } } | null | undefined)?.user?.id ??
    null;

  useEffect(() => {
    const bridge = window as Window & {
      stellaDesktopStore?: { getAuthToken?: () => Promise<string | null> };
    };
    setDesktopAuthAvailable(
      typeof window !== "undefined" &&
        typeof bridge.stellaDesktopStore?.getAuthToken === "function",
    );
  }, []);

  useEffect(() => {
    clearCachedToken();
  }, [desktopAuthAvailable, sessionUserId]);

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
      isLoading: Boolean(session.isPending) && !desktopAuthAvailable,
      isAuthenticated: desktopAuthAvailable || Boolean(session.data),
      fetchAccessToken,
    }),
    [desktopAuthAvailable, fetchAccessToken, session.data, session.isPending],
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
