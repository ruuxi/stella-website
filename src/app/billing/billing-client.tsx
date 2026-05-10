"use client";

import { useAction, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

// Stripe Appearance API tokens that mirror Stella's design language.
// `CheckoutElementsProvider` uses Stripe's Elements SDK and supports
// theme + variables + rules; keep this aligned with `billing.css` so
// the embedded `PaymentElement` reads as a native Stella surface.
const stripeAppearance = {
  theme: "flat" as const,
  variables: {
    fontFamily:
      'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSizeBase: "14px",
    spacingUnit: "4px",
    borderRadius: "6px",
    colorPrimary: "#0f1728",
    colorText: "#0f1728",
    colorTextSecondary: "#5f7186",
    colorBackground: "#ffffff",
    colorDanger: "#c44",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(82, 104, 134, 0.28)",
      boxShadow: "none",
      padding: "10px 12px",
    },
    ".Input:focus": {
      border: "1px solid #0f1728",
      boxShadow: "0 0 0 1px #0f1728",
    },
    ".Label": {
      fontSize: "11px",
      fontWeight: "500",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#5f7186",
    },
    ".Tab": {
      border: "1px solid rgba(82, 104, 134, 0.18)",
      boxShadow: "none",
    },
    ".Tab:hover": {
      border: "1px solid rgba(82, 104, 134, 0.36)",
    },
    ".Tab--selected": {
      border: "1px solid #0f1728",
      boxShadow: "0 0 0 1px #0f1728",
    },
  },
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
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutSessionPayload | null>(null);
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

  const handleCheckoutSuccess = useCallback(() => {
    setCheckoutSession(null);
    setPendingPlan(null);
    setNotice("Payment received. Your updated plan will appear in a moment.");
  }, []);

  const handleCheckoutClose = useCallback(() => {
    setCheckoutSession(null);
    setPendingPlan(null);
  }, []);

  // Elements provider options: client secret comes back directly from
  // our Convex action; appearance lives under `elementsOptions`.
  const checkoutOptions = useMemo(() => {
    if (!checkoutSession) return null;
    return {
      clientSecret: checkoutSession.clientSecret,
      elementsOptions: { appearance: stripeAppearance },
    };
  }, [checkoutSession]);

  const checkoutPlanDisplay = pendingPlan ? getPlanDisplay(pendingPlan) : null;

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

        {checkoutSession && checkoutOptions && checkoutPlanDisplay ? (
          <section ref={checkoutRef} className="billing-checkout-section">
            <div className="billing-checkout-head">
              <div className="billing-checkout-headline">
                <p className="billing-eyebrow">Checkout</p>
                <h2 className="billing-section-title">
                  Stella {checkoutPlanDisplay.label}
                </h2>
              </div>
              <button
                type="button"
                className="billing-link-button"
                onClick={handleCheckoutClose}
              >
                Cancel
              </button>
            </div>
            <CheckoutElementsProvider
              stripe={getStripePromise(checkoutSession.publishableKey)}
              options={checkoutOptions}
            >
              <CheckoutForm
                planLabel={checkoutPlanDisplay.label}
                planMonthlyPriceCents={checkoutPlanDisplay.monthlyPriceCents}
                onSuccess={handleCheckoutSuccess}
              />
            </CheckoutElementsProvider>
          </section>
        ) : null}
      </div>
    </main>
  );
}

type CheckoutFormProps = {
  planLabel: string;
  planMonthlyPriceCents: number;
  onSuccess: () => void;
};

function CheckoutForm({
  planLabel,
  planMonthlyPriceCents,
  onSuccess,
}: CheckoutFormProps) {
  const result = useCheckoutElements();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The form SDK is async-loaded — show a placeholder until the SDK
  // resolves. `useCheckoutForm` returns a discriminated union; only
  // `success` exposes the `checkout` action surface.
  const checkout = result.type === "success" ? result.checkout : null;
  const sdkError = result.type === "error" ? result.error.message : null;

  // Seed the local email field from whatever Stripe already has on the
  // session (set when we passed a `customer` with a stored email).
  useEffect(() => {
    if (!checkout) return;
    if (checkout.email && !email) {
      setEmail(checkout.email);
    }
  }, [checkout, email]);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting || !checkout) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        if (email && email !== checkout.email) {
          const updateResult = await checkout.updateEmail(email);
          if (updateResult.type === "error") {
            setSubmitError(updateResult.error.message);
            return;
          }
        }
        const confirmResult = await checkout.confirm();
        if (confirmResult.type === "error") {
          setSubmitError(confirmResult.error.message);
          return;
        }
        onSuccess();
      } catch (err) {
        setSubmitError(
          getErrorMessage(err, "Payment could not be completed."),
        );
      } finally {
        setSubmitting(false);
      }
    },
    [checkout, email, onSuccess, submitting],
  );

  // `checkout.total.total.amount` is a pre-formatted display string from
  // Stripe (e.g. "$20.00"). Fall back to the static plan price while the
  // SDK is loading so the summary doesn't flicker.
  const fallbackFormatted = currencyFormatter.format(
    planMonthlyPriceCents / 100,
  );
  const totalFormatted =
    checkout?.total?.total?.amount ?? fallbackFormatted;

  return (
    <form className="billing-checkout-form" onSubmit={onSubmit} noValidate>
      <div className="billing-checkout-summary">
        <div>
          <span className="billing-checkout-summary-label">Plan</span>
          <span className="billing-checkout-summary-value">
            Stella {planLabel}
          </span>
        </div>
        <div>
          <span className="billing-checkout-summary-label">Billed monthly</span>
          <span className="billing-checkout-summary-value">
            {totalFormatted}
          </span>
        </div>
      </div>

      <label className="billing-checkout-field">
        <span className="billing-checkout-field-label">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="billing-checkout-input"
        />
      </label>

      <div className="billing-checkout-payment">
        <span className="billing-checkout-field-label">Payment</span>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {sdkError ? (
        <p className="billing-notice billing-notice--error" role="alert">
          {sdkError}
        </p>
      ) : null}
      {submitError ? (
        <p className="billing-notice billing-notice--error" role="alert">
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        className="billing-checkout-submit"
        disabled={submitting || !email || !checkout}
      >
        {submitting
          ? "Processing..."
          : checkout
            ? `Subscribe — ${totalFormatted}/mo`
            : "Loading..."}
      </button>

      <p className="billing-checkout-fineprint">
        By subscribing you authorize Stella to charge you {totalFormatted} each
        month until you cancel. You can cancel anytime from Manage billing.
      </p>
    </form>
  );
}
