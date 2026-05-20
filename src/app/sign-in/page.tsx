import type { Metadata } from "next";
import { SignInView } from "./sign-in-view";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to Stella with Google or a magic link — no password needed.",
  alternates: { canonical: "/sign-in" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return <SignInView />;
}
