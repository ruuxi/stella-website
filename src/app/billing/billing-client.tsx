"use client";

import { useAction, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openSignInDialog } from "@/components/auth/sign-in-dialog";

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

type EmbeddedCheckoutSessionPayload = {
  publishableKey: string;
  clientSecret: string;
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

const createEmbeddedCheckoutSession = makeFunctionReference<
  "action",
  { plan: PaidBillingPlan; returnUrl: string },
  EmbeddedCheckoutSessionPayload
>("billing:createEmbeddedCheckoutSession");

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

const stripePromiseByKey = new Map<string, Promise<Stripe | null>>();

const getStripePromise = (publishableKey: string) => {
  const existing = stripePromiseByKey.get(publishableKey);
  if (existing) return existing;
  const created = loadStripe(publishableKey);
  stripePromiseByKey.set(publishableKey, created);
  return created;
};

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

export function BillingClient() {
  const [billingNowMs, setBillingNowMs] = useState(() => Date.now());
  const [checkoutSession, setCheckoutSession] =
    useState<EmbeddedCheckoutSessionPayload | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PaidBillingPlan | null>(null);
  const [startingPlan, setStartingPlan] = useState<PaidBillingPlan | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setBillingNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("checkoutSessionId")) {
      setNotice("Checkout complete. Stella is syncing your billing now.");
      const url = new URL(window.location.href);
      url.searchParams.delete("checkoutSessionId");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const billingStatus = useQuery(getSubscriptionStatus, {
    now: billingNowMs,
  });
  const startCheckout = useAction(createEmbeddedCheckoutSession);
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

  const checkoutOptions = useMemo(
    () =>
      checkoutSession
        ? {
            clientSecret: checkoutSession.clientSecret,
            onComplete: () => {
              setCheckoutSession(null);
              setPendingPlan(null);
              setNotice(
                "Payment received. Your updated plan will appear in a moment.",
              );
            },
          }
        : null,
    [checkoutSession],
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
      setPendingPlan(plan);
      try {
        const session = await startCheckout({
          plan,
          returnUrl: getBillingReturnUrl(),
        });
        setCheckoutSession(session);
        window.requestAnimationFrame(() => {
          checkoutRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } catch (err) {
        setPendingPlan(null);
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
      window.location.href = session.url;
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

        {checkoutSession && checkoutOptions ? (
          <section ref={checkoutRef} className="billing-checkout-section">
            <div className="billing-checkout-head">
              <div>
                <p className="billing-eyebrow">Checkout</p>
                <h2 className="billing-section-title">
                  Stella {pendingPlan ? getPlanDisplay(pendingPlan).label : ""}
                </h2>
              </div>
              <button
                type="button"
                className="billing-link-button"
                onClick={() => {
                  setCheckoutSession(null);
                  setPendingPlan(null);
                }}
              >
                Close checkout
              </button>
            </div>
            <div className="billing-checkout-frame">
              <EmbeddedCheckoutProvider
                stripe={getStripePromise(checkoutSession.publishableKey)}
                options={checkoutOptions}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
