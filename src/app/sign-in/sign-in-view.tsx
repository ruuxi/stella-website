"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearCachedToken } from "@/lib/auth-token";
import { useMagicLinkAuth } from "@/lib/use-magic-link-auth";
import { isConvexConfigured } from "@/lib/convex-urls";
import styles from "./sign-in.module.css";

type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  isAnonymous?: boolean | null;
};

export function SignInView() {
  const configured = isConvexConfigured();

  if (!configured) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandLogo}>
              <Image src="/stella-logo.svg" alt="" width={32} height={32} />
            </span>
            <span className={styles.brandText}>Stella</span>
          </Link>
          <h1 className={styles.title}>Sign-in unavailable</h1>
          <p className={styles.subtitle}>
            This build of stella.sh isn&apos;t configured to talk to the Stella
            backend. Set <code>NEXT_PUBLIC_CONVEX_URL</code> (and optionally{" "}
            <code>NEXT_PUBLIC_CONVEX_SITE_URL</code>) and redeploy.
          </p>
          <Link className={styles.homeLink} href="/">
            Back to stella.sh
          </Link>
        </div>
      </main>
    );
  }

  return <ConfiguredSignInView />;
}

function ConfiguredSignInView() {
  const session = authClient.useSession();
  const sessionData = session.data as { user?: SessionUser } | null | undefined;
  const user = sessionData?.user;
  const isSignedIn = Boolean(user) && user?.isAnonymous !== true;

  if (isSignedIn && user) {
    return <SignedInPanel user={user} />;
  }

  return <MagicLinkPanel />;
}

function MagicLinkPanel() {
  const {
    email,
    setEmail,
    status,
    error,
    handleMagicLinkSubmit,
    reset,
  } = useMagicLinkAuth();

  const sending = status === "sending";
  const sent = status === "sent" || status === "verifying";
  const complete = status === "complete";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandLogo}>
            <Image src="/stella-logo.svg" alt="" width={32} height={32} />
          </span>
          <span className={styles.brandText}>Stella</span>
        </Link>

        {complete ? (
          <CompletePanel onReset={reset} />
        ) : sent ? (
          <SentPanel email={email} onReset={reset} status={status} />
        ) : (
          <>
            <h1 className={styles.title}>Sign in to Stella</h1>
            <p className={styles.subtitle}>
              Enter your email and we&apos;ll send you a one-time sign-in link.
              No password needed.
            </p>

            <form className={styles.form} onSubmit={handleMagicLinkSubmit}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={sending}
                  required
                />
              </label>

              {error ? <p className={styles.errorBanner}>{error}</p> : null}

              <button
                className={styles.button}
                type="submit"
                disabled={sending || !email.trim()}
              >
                {sending ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Sending link…
                  </>
                ) : (
                  <>
                    Email me a sign-in link
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider} />

            <p className={styles.footnote}>
              By continuing you agree to our{" "}
              <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>

            <Link className={styles.homeLink} href="/">
              Back to stella.sh
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

function SentPanel({
  email,
  status,
  onReset,
}: {
  email: string;
  status: "sent" | "verifying";
  onReset: () => void;
}) {
  return (
    <>
      <h1 className={styles.title}>Check your inbox</h1>
      <div className={styles.statusCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <MailCheck size={18} aria-hidden="true" />
          <p className={styles.statusBody}>
            We sent a sign-in link to{" "}
            <span className={styles.statusEmail}>{email}</span>.
          </p>
        </div>
        <p className={styles.statusFootnote}>
          {status === "verifying"
            ? "Got it — finishing up your sign-in…"
            : "Click the link in the email to finish signing in. This page will update automatically."}
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.linkButton} onClick={onReset}>
          Use a different email
        </button>
      </div>

      <Link className={styles.homeLink} href="/">
        Back to stella.sh
      </Link>
    </>
  );
}

function CompletePanel({ onReset }: { onReset: () => void }) {
  return (
    <>
      <h1 className={styles.title}>You&apos;re signed in</h1>
      <div className={styles.statusCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <p className={styles.statusBody}>
            Your Stella account is now signed in on this device. You can close
            this tab or head back to the homepage.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <Link className={styles.homeLink} href="/">
          Back to stella.sh
        </Link>
        <button type="button" className={styles.linkButton} onClick={onReset}>
          Sign in as someone else
        </button>
      </div>
    </>
  );
}

function SignedInPanel({ user }: { user: SessionUser }) {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = useCallback(async () => {
    setSignOutError(null);
    setSigningOut(true);
    try {
      await authClient.signOut();
      clearCachedToken();
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Failed to sign out.");
    } finally {
      setSigningOut(false);
    }
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandLogo}>
            <Image src="/stella-logo.svg" alt="" width={32} height={32} />
          </span>
          <span className={styles.brandText}>Stella</span>
        </Link>

        <h1 className={styles.title}>You&apos;re signed in</h1>

        <div className={styles.statusCard}>
          <div className={styles.signedInUser}>
            <p className={styles.signedInName}>
              {user.name?.trim() || "Welcome back"}
            </p>
            {user.email ? (
              <p className={styles.signedInEmail}>{user.email}</p>
            ) : null}
          </div>
        </div>

        {signOutError ? (
          <p className={styles.errorBanner}>{signOutError}</p>
        ) : null}

        <div className={styles.actions}>
          <Link className={styles.homeLink} href="/">
            Back to stella.sh
          </Link>
          <button
            type="button"
            className={styles.linkButton}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </main>
  );
}
