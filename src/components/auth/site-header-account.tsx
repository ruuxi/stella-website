"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useDesktopBridgeAuthUser } from "@/lib/desktop-bridge-auth";
import { isConvexConfigured } from "@/lib/convex-urls";
import { useSignInDialog } from "./sign-in-dialog";

type SessionUser = {
  email?: string;
  name?: string;
  isAnonymous?: boolean | null;
};

const SiteHeaderAccountInner = dynamic(() => Promise.resolve(InnerImpl), {
  ssr: false,
  loading: () => <SignInButton />,
});

/**
 * Account/sign-in control rendered inside the existing `<nav className="site-nav">`
 * on every marketing page. Renders nothing when the Convex backend isn't
 * configured for this build (preview deploys without env vars).
 *
 * Sign-in opens a global dialog (see `SignInDialogProvider`) instead of
 * navigating to `/sign-in`, so the user stays on the page they were reading.
 *
 * The session-aware label is loaded client-only via `next/dynamic({ ssr: false })`
 * so SSR always emits the static "Sign In" string and we avoid any hydration
 * mismatch from session state diverging between server and client.
 */
export function SiteHeaderAccount() {
  if (!isConvexConfigured()) {
    return null;
  }
  return <SiteHeaderAccountInner />;
}

function InnerImpl() {
  const session = authClient.useSession();
  const desktopUser = useDesktopBridgeAuthUser();
  const user =
    (session.data as { user?: SessionUser } | null | undefined)?.user ??
    desktopUser;
  const isSignedIn = Boolean(user) && user?.isAnonymous !== true;

  if (isSignedIn && user) {
    const label = user.name?.trim() || user.email?.trim() || "Account";
    return (
      <Link
        className="site-nav__signin"
        href="/billing"
        aria-label="Manage your Stella account"
      >
        {label}
      </Link>
    );
  }

  return <SignInButton />;
}

function SignInButton({
  label = "Sign In",
  ariaLabel,
}: {
  label?: string;
  ariaLabel?: string;
}) {
  const { open } = useSignInDialog();
  return (
    <button
      type="button"
      className="site-nav__signin"
      aria-label={ariaLabel}
      onClick={open}
    >
      {label}
    </button>
  );
}
