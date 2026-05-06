"use client";

import { useEffect, useState } from "react";

export type DesktopBridgeUser = {
  id?: string;
  email?: string;
  name?: string;
  isAnonymous?: boolean | null;
};

type DesktopStoreBridge = {
  getAuthToken?: () => Promise<string | null>;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
};

const userFromToken = (token: string): DesktopBridgeUser | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const id = typeof payload.sub === "string" ? payload.sub : undefined;
  const email = typeof payload.email === "string" ? payload.email : undefined;
  const name = typeof payload.name === "string" ? payload.name : undefined;
  const isAnonymous =
    typeof payload.isAnonymous === "boolean" ? payload.isAnonymous : null;
  if (!id && !email) return null;
  return { id, email, name, isAnonymous };
};

export function useDesktopBridgeAuthUser(): DesktopBridgeUser | null {
  const [user, setUser] = useState<DesktopBridgeUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    const bridge = (window as Window & { stellaDesktopStore?: DesktopStoreBridge })
      .stellaDesktopStore;
    if (!bridge?.getAuthToken) return;

    void bridge
      .getAuthToken()
      .then((token) => {
        if (cancelled || !token) return;
        setUser(userFromToken(token));
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
