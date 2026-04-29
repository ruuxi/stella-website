"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ExternalLink, Smartphone } from "lucide-react";
import styles from "./view.module.css";

type ClientKind = "desktop" | "mobile";

const DESKTOP_SCHEME = process.env.NEXT_PUBLIC_STELLA_DESKTOP_SCHEME?.trim() || "stella";
const MOBILE_SCHEME = process.env.NEXT_PUBLIC_STELLA_MOBILE_SCHEME?.trim() || "stella-mobile";

const isClientKind = (value: string | null): value is ClientKind =>
  value === "desktop" || value === "mobile";

const pickClient = (value: string | null): ClientKind => {
  if (isClientKind(value)) {
    return value;
  }
  if (typeof navigator !== "undefined" && /android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
    return "mobile";
  }
  return "desktop";
};

const buildDeepLink = (client: ClientKind, params: URLSearchParams) => {
  const nextParams = new URLSearchParams(params.toString());
  nextParams.delete("client");
  const base = client === "mobile" ? `${MOBILE_SCHEME}://auth` : `${DESKTOP_SCHEME}://auth/callback`;
  const query = nextParams.toString();
  return query ? `${base}?${query}` : base;
};

export function AuthCallbackView() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const isDone = searchParams.get("done") === "true";
  const preferredClient = useMemo(
    () => pickClient(searchParams.get("client")),
    [searchParams],
  );

  const hasOtt = useMemo(() => {
    if (!queryString) {
      return false;
    }
    return new URLSearchParams(queryString).has("ott");
  }, [queryString]);

  const primaryLink = useMemo(() => {
    const params = new URLSearchParams(queryString);
    return buildDeepLink(preferredClient, params);
  }, [preferredClient, queryString]);

  const alternateClient: ClientKind = preferredClient === "desktop" ? "mobile" : "desktop";

  const alternateLink = useMemo(() => {
    const params = new URLSearchParams(queryString);
    return buildDeepLink(alternateClient, params);
  }, [alternateClient, queryString]);

  useEffect(() => {
    if (isDone || !queryString || !hasOtt) {
      return;
    }
    window.location.replace(primaryLink);
  }, [isDone, hasOtt, primaryLink, queryString]);

  if (isDone) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.badge}>Stella</div>
          <h1 className={styles.title}>You&apos;re signed in</h1>
          <p className={styles.body}>
            You can close this tab and return to Stella.
          </p>
          <Link className={styles.homeLink} href="/">
            Back to stella.sh
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.badge}>Stella Sign-In</div>
        <h1 className={styles.title}>
          {hasOtt ? "Opening Stella" : "This sign-in link looks incomplete"}
        </h1>
        <p className={styles.body}>
          {hasOtt
            ? "Your email link opened on stella.sh so the address stays familiar. We're handing you off to the app now."
            : "The callback is missing the one-time sign-in token. Request a fresh magic link and try again."}
        </p>

        <div className={styles.card}>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Primary destination</span>
            <span className={styles.cardValue}>
              {preferredClient === "desktop" ? "Desktop app" : "Mobile app"}
            </span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.cardLabel}>Fallback</span>
            <span className={styles.cardValue}>
              {preferredClient === "desktop" ? "Use the mobile app link below" : "Use the desktop app link below"}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <a
            className={`${styles.button} ${styles.buttonPrimary}`}
            href={primaryLink}
          >
            Open Stella
            <ArrowRight size={16} />
          </a>
          <a
            className={`${styles.button} ${styles.buttonSecondary}`}
            href={alternateLink}
          >
            {alternateClient === "mobile" ? "Open on mobile instead" : "Open on desktop instead"}
            {alternateClient === "mobile" ? <Smartphone size={16} /> : <ExternalLink size={16} />}
          </a>
        </div>

        <p className={styles.note}>
          {hasOtt
            ? "If nothing happened, the app might not be installed or your browser may have blocked the handoff."
            : "Open the app link below to continue signing in."}
        </p>

        <Link className={styles.homeLink} href="/">
          Back to stella.sh
        </Link>
      </div>
    </main>
  );
}
