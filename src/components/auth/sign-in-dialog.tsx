"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowRight, CheckCircle2, MailCheck, X } from "lucide-react";
import { useMagicLinkAuth } from "@/lib/use-magic-link-auth";
import { isConvexConfigured } from "@/lib/convex-urls";
import formStyles from "@/app/sign-in/sign-in.module.css";
import styles from "./sign-in-dialog.module.css";

type SignInDialogContextValue = {
  open: () => void;
  close: () => void;
};

const SignInDialogContext = createContext<SignInDialogContextValue | null>(null);

/**
 * Window event used to open the sign-in dialog from non-React contexts (e.g.
 * top-level helpers in `store-client.tsx`). Prefer `useSignInDialog().open()`
 * inside React components.
 */
const SIGN_IN_DIALOG_EVENT = "stella:open-sign-in";

export function openSignInDialog() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SIGN_IN_DIALOG_EVENT));
}

/**
 * Provider that mounts a single global sign-in dialog and exposes `open`/`close`
 * via `useSignInDialog`. Renders the same magic-link flow as `/sign-in` but
 * inline, so links and buttons across the marketing site can avoid a full
 * navigation away from the current page.
 */
export function SignInDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (!isConvexConfigured()) {
      window.location.href = "/sign-in";
      return;
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (isOpen && !node.open) {
      node.showModal();
    } else if (!isOpen && node.open) {
      node.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = () => open();
    window.addEventListener(SIGN_IN_DIALOG_EVENT, handler);
    return () => window.removeEventListener(SIGN_IN_DIALOG_EVENT, handler);
  }, [open]);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onClose = () => setIsOpen(false);
    const onCancel = (event: Event) => {
      event.preventDefault();
      setIsOpen(false);
    };
    node.addEventListener("close", onClose);
    node.addEventListener("cancel", onCancel);
    return () => {
      node.removeEventListener("close", onClose);
      node.removeEventListener("cancel", onCancel);
    };
  }, []);

  const value = useMemo<SignInDialogContextValue>(
    () => ({ open, close }),
    [open, close],
  );

  return (
    <SignInDialogContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Sign in to Stella"
        onClick={(event) => {
          // Close when clicking the backdrop (the dialog element itself).
          if (event.target === dialogRef.current) {
            setIsOpen(false);
          }
        }}
      >
        <div className={styles.shell}>
          <button
            type="button"
            className={styles.close}
            aria-label="Close sign-in"
            onClick={close}
          >
            <X size={16} aria-hidden="true" />
          </button>
          {isOpen ? <DialogBody onClose={close} /> : null}
        </div>
      </dialog>
    </SignInDialogContext.Provider>
  );
}

export function useSignInDialog(): SignInDialogContextValue {
  const ctx = useContext(SignInDialogContext);
  if (ctx) return ctx;
  // Fallback for trees that don't have the provider (e.g. preview builds
  // without Convex configured): just navigate to the dedicated page.
  return {
    open: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
    },
    close: () => {},
  };
}

function DialogBody({ onClose }: { onClose: () => void }) {
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
    <>
      <Link className={styles.brand} href="/" onClick={onClose}>
        <span className={styles.brandLogo}>
          <Image src="/stella-logo.svg" alt="" width={28} height={28} />
        </span>
        <span className={styles.brandText}>Stella</span>
      </Link>

      {complete ? (
        <CompleteBody onClose={onClose} onReset={reset} />
      ) : sent ? (
        <SentBody email={email} status={status} onReset={reset} />
      ) : (
        <>
          <h2 className={formStyles.title}>Sign in to Stella</h2>
          <p className={formStyles.subtitle}>
            Enter your email and we&apos;ll send you a one-time sign-in link.
            No password needed.
          </p>

          <form className={formStyles.form} onSubmit={handleMagicLinkSubmit}>
            <label className={formStyles.field}>
              <span className={formStyles.label}>Email</span>
              <input
                className={formStyles.input}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={sending}
                required
                autoFocus
              />
            </label>

            {error ? <p className={formStyles.errorBanner}>{error}</p> : null}

            <button
              className={formStyles.button}
              type="submit"
              disabled={sending || !email.trim()}
            >
              {sending ? (
                <>
                  <span className={formStyles.spinner} aria-hidden="true" />
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

          <p className={formStyles.footnote}>
            By continuing you agree to our{" "}
            <Link href="/terms" onClick={onClose}>
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" onClick={onClose}>
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </>
  );
}

function SentBody({
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
      <h2 className={formStyles.title}>Check your inbox</h2>
      <div className={formStyles.statusCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <MailCheck size={18} aria-hidden="true" />
          <p className={formStyles.statusBody}>
            We sent a sign-in link to{" "}
            <span className={formStyles.statusEmail}>{email}</span>.
          </p>
        </div>
        <p className={formStyles.statusFootnote}>
          {status === "verifying"
            ? "Got it — finishing up your sign-in…"
            : "Click the link in the email to finish signing in. This dialog will update automatically."}
        </p>
      </div>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={formStyles.linkButton}
          onClick={onReset}
        >
          Use a different email
        </button>
      </div>
    </>
  );
}

function CompleteBody({
  onClose,
  onReset,
}: {
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <h2 className={formStyles.title}>You&apos;re signed in</h2>
      <div className={formStyles.statusCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <p className={formStyles.statusBody}>
            Your Stella account is now signed in on this device.
          </p>
        </div>
      </div>
      <div className={formStyles.actions}>
        <button
          type="button"
          className={formStyles.linkButton}
          onClick={onClose}
        >
          Done
        </button>
        <button
          type="button"
          className={formStyles.linkButton}
          onClick={onReset}
        >
          Sign in as someone else
        </button>
      </div>
    </>
  );
}
