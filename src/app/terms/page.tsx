import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_TITLES, TERMS_OF_SERVICE } from "@/lib/legal-text";
import "../legal.css";

export const metadata: Metadata = {
  title: LEGAL_TITLES.terms,
  description:
    "Terms governing your use of Stella, including the desktop application, mobile companion app, backend services, and related websites or APIs.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="legal-doc-page">
      <div className="legal-doc-page__bar">
        <Link className="legal-doc-page__back" href="/">
          ← Back to Stella
        </Link>
      </div>
      <main className="legal-doc-page__main">
        <h1 className="legal-doc-page__title">{LEGAL_TITLES.terms}</h1>
        <pre className="legal-doc-page__text">{TERMS_OF_SERVICE}</pre>
      </main>
    </div>
  );
}
