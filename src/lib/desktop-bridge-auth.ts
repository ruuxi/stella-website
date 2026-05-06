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
  getAuthSession?: () => Promise<unknown>;
};

type BetterAuthSessionPayload = {
  user?: DesktopBridgeUser | null;
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

const userFromSession = (session: unknown): DesktopBridgeUser | null => {
  const payload = session as BetterAuthSessionPayload | null | undefined;
  const user = payload?.user;
  if (!user || typeof user !== "object") return null;
  const id = typeof user.id === "string" ? user.id : undefined;
  const email = typeof user.email === "string" ? user.email : undefined;
  const name = typeof user.name === "string" ? user.name : undefined;
  const isAnonymous =
    typeof user.isAnonymous === "boolean" ? user.isAnonymous : null;
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

    void Promise.resolve()
      .then(async () => {
        const session = await bridge.getAuthSession?.();
        const sessionUser = userFromSession(session);
        if (sessionUser) return sessionUser;
        const token = await bridge.getAuthToken?.();
        return token ? userFromToken(token) : null;
      })
      .then((nextUser) => {
        if (cancelled) return;
        setUser(nextUser);
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
