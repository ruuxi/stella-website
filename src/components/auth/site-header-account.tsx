"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { isConvexConfigured } from "@/lib/convex-urls";

type SessionUser = {
  email?: string;
  name?: string;
  isAnonymous?: boolean | null;
};

const SiteHeaderAccountInner = dynamic(() => Promise.resolve(InnerImpl), {
  ssr: false,
  loading: () => <Link href="/sign-in">Sign In</Link>,
});

/**
 * Account/sign-in link rendered inside the existing `<nav className="site-nav">`
 * on every marketing page. Renders nothing when the Convex backend isn't
 * configured for this build (preview deploys without env vars).
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
  const user = (session.data as { user?: SessionUser } | null | undefined)?.user;
  const isSignedIn = Boolean(user) && user?.isAnonymous !== true;

  if (isSignedIn && user) {
    const label = user.name?.trim() || user.email?.trim() || "Account";
    return (
      <Link href="/sign-in" aria-label="View your Stella account">
        {label}
      </Link>
    );
  }

  return <Link href="/sign-in">Sign In</Link>;
}
