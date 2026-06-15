"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearCachedToken } from "@/lib/auth-token";
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
    return <AccountMenu user={user} />;
  }

  return <SignInButton />;
}

/**
 * Signed-in account control: a hover/focus popover (reusing the primary nav's
 * `site-nav__group` styling) that links to billing and offers a sign-out
 * action. The popover is right-aligned so it stays inside the viewport at the
 * far-right edge of the header.
 */
function AccountMenu({ user }: { user: SessionUser }) {
  const label = user.name?.trim() || user.email?.trim() || "Account";
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      clearCachedToken();
    } catch {
      // Drop the cached token regardless so the client stops presenting a
      // stale session; the session hook re-renders to the signed-out state.
      clearCachedToken();
    } finally {
      setSigningOut(false);
    }
  }, []);

  return (
    <div className="site-nav__group">
      <button
        type="button"
        className="site-nav__trigger"
        aria-haspopup="true"
        aria-label="Account menu"
      >
        {label}
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      <div className="site-nav__menu site-nav__menu--end">
        <div className="site-nav__panel">
          <Link href="/billing">Manage account</Link>
          <button
            type="button"
            className="site-nav__panel-action"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
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
