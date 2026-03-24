import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_TITLES, PRIVACY_POLICY } from "@/lib/legal-text";
import "../legal.css";

export const metadata: Metadata = {
  title: LEGAL_TITLES.privacy,
  description:
    "How FromYou LLC handles information when you use Stella, including the desktop app, mobile companion, backend services, and related websites or APIs.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="legal-doc-page">
      <div className="legal-doc-page__bar">
        <Link className="legal-doc-page__back" href="/">
          ← Back to Stella
        </Link>
      </div>
      <main className="legal-doc-page__main">
        <h1 className="legal-doc-page__title">{LEGAL_TITLES.privacy}</h1>
        <pre className="legal-doc-page__text">{PRIVACY_POLICY}</pre>
      </main>
    </div>
  );
}
