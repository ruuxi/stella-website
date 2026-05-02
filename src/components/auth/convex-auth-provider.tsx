"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { clearCachedToken, getConvexToken } from "@/lib/auth-token";
import { getConvexClient } from "@/lib/convex-client";
import { isConvexConfigured } from "@/lib/convex-urls";

function useWebsiteConvexAuth() {
  const session = authClient.useSession();

  const sessionUserId =
    (session.data as { user?: { id?: string } } | null | undefined)?.user?.id ??
    null;

  useEffect(() => {
    clearCachedToken();
  }, [sessionUserId]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken = false }: { forceRefreshToken?: boolean } = {}) => {
      return await getConvexToken({ forceRefresh: forceRefreshToken });
    },
    // Re-mount on identity change so ConvexProviderWithAuth re-runs setAuth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionUserId],
  );

  return useMemo(
    () => ({
      isLoading: Boolean(session.isPending),
      isAuthenticated: Boolean(session.data),
      fetchAccessToken,
    }),
    [fetchAccessToken, session.data, session.isPending],
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
