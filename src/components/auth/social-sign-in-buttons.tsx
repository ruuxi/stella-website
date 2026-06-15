"use client";

import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";
import formStyles from "@/app/sign-in/sign-in.module.css";

type SocialProvider = "apple" | "google";

type SocialSignInButtonsProps = {
  callbackURL?: string;
};

type SocialSignInResult = {
  error?: {
    message?: string;
    statusText?: string;
  } | null;
};

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  apple: "Apple",
  google: "Google",
};

/**
 * Apple + Google sign-in buttons for the marketing site. Both use Better Auth's
 * redirect OAuth flow (`signIn.social`), the same flow the mobile app uses for
 * its non-native branch. Apple is listed first to match the mobile login screen
 * and Apple's own guidance.
 */
export function SocialSignInButtons({ callbackURL }: SocialSignInButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(
    async (provider: SocialProvider) => {
      setError(null);
      setPendingProvider(provider);

      try {
        const nextURL =
          callbackURL ??
          (typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}${window.location.hash}`
            : "/");
        const result = (await authClient.signIn.social({
          provider,
          callbackURL: nextURL,
        })) as SocialSignInResult | undefined;

        if (result?.error) {
          setError(
            result.error.message ||
              result.error.statusText ||
              `${PROVIDER_LABEL[provider]} sign-in could not start.`,
          );
          setPendingProvider(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `${PROVIDER_LABEL[provider]} sign-in could not start.`,
        );
        setPendingProvider(null);
      }
    },
    [callbackURL],
  );

  const disabled = pendingProvider !== null;

  return (
    <div className={formStyles.socialAuth}>
      <button
        className={`${formStyles.socialButton} ${formStyles.appleButton}`}
        type="button"
        onClick={() => void handleSignIn("apple")}
        disabled={disabled}
      >
        <AppleIcon />
        {pendingProvider === "apple"
          ? "Opening Apple..."
          : "Continue with Apple"}
      </button>

      <button
        className={formStyles.socialButton}
        type="button"
        onClick={() => void handleSignIn("google")}
        disabled={disabled}
      >
        <GoogleIcon />
        {pendingProvider === "google"
          ? "Opening Google..."
          : "Continue with Google"}
      </button>

      {error ? <p className={formStyles.errorBanner}>{error}</p> : null}
    </div>
  );
}

function AppleIcon() {
  return (
    <svg
      className={formStyles.appleIcon}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M14.38 9.55c-.02-2.08 1.7-3.09 1.78-3.14-.97-1.42-2.48-1.61-3.01-1.63-1.27-.13-2.5.75-3.14.75-.65 0-1.64-.73-2.7-.71-1.38.02-2.67.82-3.38 2.08-1.46 2.53-.37 6.25 1.03 8.3.7 1 1.52 2.12 2.6 2.08 1.05-.04 1.44-.67 2.7-.67s1.62.67 2.72.65c1.13-.02 1.85-1.01 2.52-2.03.8-1.15 1.13-2.28 1.14-2.34-.03-.01-2.24-.86-2.26-3.34ZM12.32 3.43c.56-.7.94-1.65.84-2.61-.82.04-1.85.57-2.43 1.25-.52.61-.99 1.6-.87 2.52.93.07 1.88-.47 2.46-1.16Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      className={formStyles.googleIcon}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.89 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.95-2.18l-2.91-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.59.1-1.16.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
