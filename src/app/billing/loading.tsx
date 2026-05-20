import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/site-header";
import "./billing.css";

/**
 * Route-level loading shell. Matches `BillingClient`'s outer geometry
 * (hero + account card) so the first paint is the same shape the user
 * is about to see — no blank flash, no layout jump.
 */
export default function BillingLoading() {
  return (
    <div className="stella-page">
      <SiteHeader />
      <main className="billing-root" aria-busy="true">
        <div className="billing-shell">
          <header className="billing-hero">
            <p className="billing-eyebrow">Billing</p>
            <h1 className="billing-title">
              <span
                className="loading-text"
                style={{ "--w": "18ch" } as CSSProperties}
                aria-label="Loading billing"
              />
            </h1>
            <p className="billing-lead">
              <span
                className="loading-text"
                style={{ "--w": "42ch" } as CSSProperties}
              />
            </p>
          </header>
          <section className="billing-account" aria-label="Loading account">
            <div className="billing-account-head">
              <div className="billing-account-plan">
                <span className="billing-status-label">Current plan</span>
                <span className="billing-status-value">
                  <span
                    className="loading-text"
                    style={{ "--w": "6ch" } as CSSProperties}
                  />
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
