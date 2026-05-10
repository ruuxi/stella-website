"use client";

import { useAction, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useCallback, useEffect, useState } from "react";
import { openSignInDialog } from "@/components/auth/sign-in-dialog";
import { isConvexConfigured } from "@/lib/convex-urls";

type BillingPlan = "free" | "go" | "pro" | "plus" | "ultra";
type PaidBillingPlan = Exclude<BillingPlan, "free">;

type BillingPlanConfig = {
  label: string;
  monthlyPriceCents: number;
  rollingLimitUsd: number;
  rollingWindowHours: number;
  weeklyLimitUsd: number;
  monthlyLimitUsd: number;
  tokensPerMinute: number;
};

type BillingUsage = {
  rollingUsedUsd: number;
  rollingLimitUsd: number;
  weeklyUsedUsd: number;
  weeklyLimitUsd: number;
  monthlyUsedUsd: number;
  monthlyLimitUsd: number;
};

type BillingStatus = {
  authenticated: boolean;
  isAnonymous: boolean;
  plan: BillingPlan;
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number | null;
  usage: BillingUsage;
  plans: Record<BillingPlan, BillingPlanConfig>;
};

type CheckoutSessionPayload = {
  url: string;
  sessionId: string;
};

type BillingPortalSessionPayload = {
  url: string;
};

const getSubscriptionStatus = makeFunctionReference<
  "query",
  { now: number },
  BillingStatus
>("billing:getSubscriptionStatus");

const createCheckoutSession = makeFunctionReference<
  "action",
  { plan: PaidBillingPlan; returnUrl: string },
  CheckoutSessionPayload
>("billing:createCheckoutSession");

const createBillingPortalSession = makeFunctionReference<
  "action",
  { returnUrl: string },
  BillingPortalSessionPayload
>("billing:createBillingPortalSession");

const PLAN_ORDER: BillingPlan[] = ["free", "go", "pro", "plus", "ultra"];
const RECOMMENDED_PLAN: BillingPlan = "pro";

const STATIC_PLAN_DISPLAY: Record<
  BillingPlan,
  { label: string; monthlyPriceCents: number }
> = {
  free: { label: "Free", monthlyPriceCents: 0 },
  go: { label: "Go", monthlyPriceCents: 2_000 },
  pro: { label: "Pro", monthlyPriceCents: 6_000 },
  plus: { label: "Plus", monthlyPriceCents: 10_000 },
  ultra: { label: "Ultra", monthlyPriceCents: 20_000 },
};

const PLAN_USAGE_TAGLINE: Record<BillingPlan, string> = {
  free: "Light usage to try Stella",
  go: "Baseline monthly usage",
  pro: "3x the usage of Go",
  plus: "5x the usage of Go",
  ultra: "10x the usage of Go",
};

const SHARED_FEATURES: readonly string[] = [
  "Unlimited chat with Stella",
  "Bring any model, local or cloud",
  "Browser, voice and screen control",
  "Image, video, audio and 3D generation",
  "All apps, integrations and connectors",
  "Self-modifying personalization",
  "Priority response times",
  "Files stay on your device",
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const toUsagePercent = (usedUsd: number, limitUsd: number) => {
  if (!Number.isFinite(limitUsd) || limitUsd <= 0) return 0;
  if (!Number.isFinite(usedUsd) || usedUsd <= 0) return 0;
  return Math.min(100, Math.max(0, (usedUsd / limitUsd) * 100));
};

const getBillingReturnUrl = () => {
  const url = new URL("/billing", window.location.origin);
  return url.toString();
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

// Stripe hosted checkout lives on `checkout.stripe.com`. On the website we
// open it in a new tab via `window.open`; inside Stella's desktop
// WebContentsView the same call is intercepted by `setWindowOpenHandler`
// and routed to `shell.openExternal`, which opens it in the user's system
// browser. Either way the user lands back on `/billing?checkout=success`
// when Stripe finishes redirecting.
const openStripeCheckoutUrl = (url: string) => {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    // Popup blocker (or some embedded contexts) can return null; fall back
    // to a same-tab navigation so the user always reaches checkout.
    window.location.href = url;
  }
};

export function BillingClient() {
  // Skip the Convex-bound interactive flow when no deployment is configured
  // (e.g. preview builds without env vars). Lets `/billing` still SSG with a
  // marketing-style hero instead of crashing on `useQuery`.
  if (!isConvexConfigured()) {
    return (
      <main className="billing-root">
        <div className="billing-shell">
          <header className="billing-hero">
            <p className="billing-eyebrow">Billing</p>
            <h1 className="billing-title">
              Choose how much <em>Stella</em>.
            </h1>
            <p className="billing-lead">
              Billing is available inside Stella once the backend connection is
              configured.
            </p>
          </header>
        </div>
      </main>
    );
  }

  return <BillingInteractive />;
}

function BillingInteractive() {
  const [billingNowMs, setBillingNowMs] = useState(() => Date.now());
  const [startingPlan, setStartingPlan] = useState<PaidBillingPlan | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setBillingNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Stripe redirects back to /billing with ?checkout=success or
  // ?checkout=cancel — surface a friendly notice and clear the param so a
  // page refresh doesn't keep showing it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("checkout");
    if (!status) return;
    if (status === "success") {
      setNotice("Payment received. Your updated plan will appear in a moment.");
    } else if (status === "cancel") {
      setNotice("Checkout cancelled. You can pick a plan whenever you're ready.");
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(null, "", url.toString());
  }, []);

  const billingStatus = useQuery(getSubscriptionStatus, {
    now: billingNowMs,
  });
  const startCheckout = useAction(createCheckoutSession);
  const openPortal = useAction(createBillingPortalSession);

  const planCatalog = billingStatus?.plans;
  const currentPlan = billingStatus?.plan ?? "free";
  const usage = billingStatus?.usage;
  const hasAccount = Boolean(
    billingStatus?.authenticated && !billingStatus.isAnonymous,
  );
  const isLoadingStatus = billingStatus === undefined;

  const getPlanDisplay = useCallback(
    (plan: BillingPlan) => {
      const live = planCatalog?.[plan];
      const fallback = STATIC_PLAN_DISPLAY[plan];
      return {
        label: live?.label ?? fallback.label,
        monthlyPriceCents: live?.monthlyPriceCents ?? fallback.monthlyPriceCents,
      };
    },
    [planCatalog],
  );

  const handleStartCheckout = useCallback(
    async (plan: PaidBillingPlan) => {
      if (!hasAccount) {
        openSignInDialog();
        return;
      }
      setError(null);
      setNotice(null);
      setStartingPlan(plan);
      try {
        const session = await startCheckout({
          plan,
          returnUrl: getBillingReturnUrl(),
        });
        openStripeCheckoutUrl(session.url);
      } catch (err) {
        setError(getErrorMessage(err, "Unable to start checkout right now."));
      } finally {
        setStartingPlan(null);
      }
    },
    [hasAccount, startCheckout],
  );

  const handleOpenPortal = useCallback(async () => {
    if (!hasAccount) {
      openSignInDialog();
      return;
    }
    setError(null);
    setNotice(null);
    setOpeningPortal(true);
    try {
      const session = await openPortal({ returnUrl: getBillingReturnUrl() });
      openStripeCheckoutUrl(session.url);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to open billing right now."));
    } finally {
      setOpeningPortal(false);
    }
  }, [hasAccount, openPortal]);

  return (
    <main className="billing-root">
      <div className="billing-shell">
        <header className="billing-hero">
          <p className="billing-eyebrow">Billing</p>
          <h1 className="billing-title">
            Choose how much <em>Stella</em>.
          </h1>
          <p className="billing-lead">
            Every plan includes the full Stella experience. The only thing that
            changes between tiers is how much you can use each month.
          </p>
        </header>

        {error ? (
          <p className="billing-notice billing-notice--error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className="billing-notice">{notice}</p> : null}

        <section className="billing-status" aria-label="Current billing status">
          <div className="billing-status-info">
            <span className="billing-status-label">Current plan</span>
            <span className="billing-status-value">
              {isLoadingStatus ? "..." : getPlanDisplay(currentPlan).label}
            </span>
          </div>

          {usage && planCatalog ? (
            <div className="billing-status-meter">
              <div className="billing-status-meter-label">
                <span>Usage this month</span>
                <span>
                  {usdFormatter.format(usage.monthlyUsedUsd)} /{" "}
                  {usdFormatter.format(usage.monthlyLimitUsd)}
                </span>
              </div>
              <div className="billing-meter-track">
                <div
                  className="billing-meter-fill"
                  style={{
                    width: `${toUsagePercent(
                      usage.monthlyUsedUsd,
                      usage.monthlyLimitUsd,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="billing-link-button"
            onClick={() => void handleOpenPortal()}
            disabled={
              !hasAccount ||
              openingPortal ||
              isLoadingStatus ||
              !planCatalog ||
              currentPlan === "free"
            }
          >
            {openingPortal ? "Opening..." : "Manage billing ->"}
          </button>
        </section>

        <section className="billing-plans-section">
          <div className="billing-section-head">
            <h2 className="billing-section-title">Plans</h2>
            <p className="billing-section-sub">
              Cancel or change anytime. Prices in USD.
            </p>
          </div>

          <div className="billing-plans-grid">
            {PLAN_ORDER.map((plan) => {
              const display = getPlanDisplay(plan);
              const isCurrentPlan = plan === currentPlan;
              const isPaidPlan = plan !== "free";
              const isStartingThisPlan = startingPlan === plan;
              const isRecommended =
                plan === RECOMMENDED_PLAN && currentPlan !== RECOMMENDED_PLAN;
              const ctaLabel = isCurrentPlan
                ? "Current plan"
                : isStartingThisPlan
                  ? "Opening..."
                  : !hasAccount && isPaidPlan
                    ? `Sign in for ${display.label}`
                    : isPaidPlan
                      ? `Choose ${display.label}`
                      : "Included";

              return (
                <article
                  key={plan}
                  className="billing-plan"
                  data-active={isCurrentPlan || undefined}
                  data-recommended={isRecommended || undefined}
                >
                  <div className="billing-plan-name">{display.label}</div>
                  <div className="billing-plan-price">
                    <span className="billing-plan-price-value">
                      {display.monthlyPriceCents <= 0
                        ? "Free"
                        : currencyFormatter.format(
                            display.monthlyPriceCents / 100,
                          )}
                    </span>
                    {display.monthlyPriceCents > 0 ? (
                      <span className="billing-plan-price-period">/mo</span>
                    ) : null}
                  </div>
                  <p className="billing-plan-allotment">
                    {PLAN_USAGE_TAGLINE[plan]}
                  </p>
                  <hr className="billing-plan-rule" />
                  <button
                    type="button"
                    className={
                      "billing-plan-cta" +
                      (isCurrentPlan ? " billing-plan-cta--current" : "")
                    }
                    onClick={() => {
                      if (isPaidPlan && !isCurrentPlan) {
                        void handleStartCheckout(plan as PaidBillingPlan);
                      }
                    }}
                    disabled={isCurrentPlan || !isPaidPlan || startingPlan !== null}
                  >
                    {ctaLabel}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="billing-features">
            <div className="billing-features-head">Included on every plan</div>
            <ul className="billing-features-list">
              {SHARED_FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
