"use client";

import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";
import formStyles from "@/app/sign-in/sign-in.module.css";

type GoogleSignInButtonProps = {
  callbackURL?: string;
};

type SocialSignInResult = {
  error?: {
    message?: string;
    statusText?: string;
  } | null;
};

export function GoogleSignInButton({ callbackURL }: GoogleSignInButtonProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setIsSigningIn(true);

    try {
      const nextURL =
        callbackURL ??
        (typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}${window.location.hash}`
          : "/");
      const result = (await authClient.signIn.social({
        provider: "google",
        callbackURL: nextURL,
      })) as SocialSignInResult | undefined;

      if (result?.error) {
        setError(
          result.error.message ||
            result.error.statusText ||
            "Google sign-in could not start.",
        );
        setIsSigningIn(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in could not start.");
      setIsSigningIn(false);
    }
  }, [callbackURL]);

  return (
    <div className={formStyles.socialAuth}>
      <button
        className={formStyles.socialButton}
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSigningIn}
      >
        <GoogleIcon />
        {isSigningIn ? "Opening Google..." : "Continue with Google"}
      </button>
      {error ? <p className={formStyles.errorBanner}>{error}</p> : null}
    </div>
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
