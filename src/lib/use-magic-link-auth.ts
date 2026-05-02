"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { getSetCookie } from "@convex-dev/better-auth/client/plugins";
import { authClient } from "./auth-client";
import { tryReadConvexSiteUrl } from "./convex-urls";

/**
 * Polling-based magic-link sign-in used by the website.
 *
 * Mirrors `desktop/src/global/auth/useMagicLinkAuth.ts`: post the email to
 * the Convex backend's `/api/auth/link/send` route, then poll
 * `/api/auth/link/status?requestId=...` until the backend completes the
 * request with a `sessionCookie`. The cookie is the raw `Set-Cookie` value
 * for the Better Auth session and is stored under the same localStorage
 * key the cross-domain client looks for.
 */

const BETTER_AUTH_COOKIE_STORAGE_KEY = "better-auth_cookie";

const POLL_INTERVAL_MS = 2500;

export type MagicLinkStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "complete"
  | "error";

export interface UseMagicLinkAuthResult {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  status: MagicLinkStatus;
  error: string | null;
  handleMagicLinkSubmit: (event: FormEvent) => Promise<void>;
  reset: () => void;
}

export const useMagicLinkAuth = (): UseMagicLinkAuthResult => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<MagicLinkStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  const handleMagicLinkSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    const convexSiteUrl = tryReadConvexSiteUrl();
    if (!convexSiteUrl) {
      setStatus("error");
      setError(
        "Sign-in isn't configured for this build. Contact the team or set NEXT_PUBLIC_CONVEX_URL.",
      );
      return;
    }

    setError(null);
    setStatus("sending");

    try {
      const response = await fetch(`${convexSiteUrl}/api/auth/link/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await response.json()) as {
        requestId?: string;
        error?: string;
      };
      if (!response.ok || !data.requestId) {
        throw new Error(data.error || "Failed to send sign-in email.");
      }
      setRequestId(data.requestId);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send sign-in email.");
    }
  };

  useEffect(() => {
    if (status !== "sent" || !requestId) return;
    const convexSiteUrl = tryReadConvexSiteUrl();
    if (!convexSiteUrl) return;

    cancelledRef.current = false;

    const poll = async () => {
      while (!cancelledRef.current) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (cancelledRef.current) return;

        try {
          const res = await fetch(
            `${convexSiteUrl}/api/auth/link/status?requestId=${encodeURIComponent(requestId)}`,
          );
          if (!res.ok) continue;
          const data = (await res.json()) as {
            status: string;
            ott?: string;
            sessionCookie?: string;
          };

          if (data.status === "completed" && data.sessionCookie) {
            if (cancelledRef.current) return;
            setStatus("verifying");
            try {
              const prev = localStorage.getItem(BETTER_AUTH_COOKIE_STORAGE_KEY);
              const merged = getSetCookie(data.sessionCookie, prev ?? undefined);
              localStorage.setItem(BETTER_AUTH_COOKIE_STORAGE_KEY, merged);
              const store = (
                authClient as unknown as {
                  $store?: { notify: (s: string) => void };
                }
              ).$store;
              if (store) {
                store.notify("$sessionSignal");
              } else {
                await authClient.getSession();
              }
              setStatus("complete");
            } catch {
              setStatus("error");
              setError("Could not finish sign-in. Please try again.");
              setRequestId(null);
            }
            return;
          }

          if (data.status === "completed") {
            if (cancelledRef.current) return;
            setStatus("error");
            setError("Sign-in incomplete. Please try again.");
            setRequestId(null);
            return;
          }

          if (data.status === "expired") {
            if (cancelledRef.current) return;
            setStatus("error");
            setError("Sign-in link expired. Please request a new one.");
            setRequestId(null);
            return;
          }
        } catch {
          // Retry silently on network errors.
        }
      }
    };

    void poll();
    return () => {
      cancelledRef.current = true;
    };
  }, [status, requestId]);

  const reset = () => {
    cancelledRef.current = true;
    setEmail("");
    setStatus("idle");
    setError(null);
    setRequestId(null);
  };

  return {
    email,
    setEmail,
    status,
    error,
    handleMagicLinkSubmit,
    reset,
  };
};
