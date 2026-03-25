import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCallbackView } from "./view";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Complete your Stella sign-in.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackView />
    </Suspense>
  );
}
