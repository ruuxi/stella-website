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
  introFirstMonthPriceCents?: number;
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

type UsageCreditPurchaseOptions = {
  currency: string;
  minAmountCents: number;
  maxAmountCents: number;
  presetAmountCents: number[];
};

type UsageCreditStatus = {
  authenticated: boolean;
  currency: string;
  balanceUsd: number;
  totalPurchasedUsd: number;
  totalConsumedUsd: number;
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

const getUsageCreditPurchaseOptions = makeFunctionReference<
  "query",
  Record<string, never>,
  UsageCreditPurchaseOptions
>("billing:getUsageCreditPurchaseOptions");

const getUsageCreditStatus = makeFunctionReference<
  "query",
  Record<string, never>,
  UsageCreditStatus
>("billing:getUsageCreditStatus");

const createUsageCreditCheckoutSession = makeFunctionReference<
  "action",
  { amountCents: number; returnUrl: string },
  CheckoutSessionPayload
>("billing:createUsageCreditCheckoutSession");

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

const BASE_PLAN_FEATURES: readonly string[] = [
  "Voice features",
  "Image, video, audio and 3D generation",
];

// Pro and above unlock the higher-throughput Standard variant in the
// model picker, so call it out explicitly on those tiers without using
// the word "faster" (which to most users implies "dumber").
const PRIORITY_PLAN_FEATURE = "Higher priority, increased speeds";

// Every paid plan grants the verified author badge that surfaces next
// to your username on Store posts. Free doesn't get it.
const VERIFIED_BADGE_FEATURE = "Verified creator badge on the Store";

const PRIORITY_PLANS = new Set<BillingPlan>(["pro", "plus", "ultra"]);
const PAID_PLANS = new Set<BillingPlan>(["go", "pro", "plus", "ultra"]);

const getPlanFeatures = (plan: BillingPlan): readonly string[] => {
  const features: string[] = [];
  if (PRIORITY_PLANS.has(plan)) features.push(PRIORITY_PLAN_FEATURE);
  features.push(...BASE_PLAN_FEATURES);
  if (PAID_PLANS.has(plan)) features.push(VERIFIED_BADGE_FEATURE);
  return features;
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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const toUsagePercent = (usedUsd: number, limitUsd: number) => {
  if (!Number.isFinite(limitUsd) || limitUsd <= 0) return 0;
  if (!Number.isFinite(usedUsd) || usedUsd <= 0) return 0;
  return Math.min(100, Math.max(0, (usedUsd / limitUsd) * 100));
};

// Round to a whole percent for display while keeping the meter bar at the
// precise sub-percent width — avoids "0%" reading next to a visibly non-empty
// bar (and vice versa) at the edges.
const formatUsagePercent = (usedUsd: number, limitUsd: number) => {
  const pct = toUsagePercent(usedUsd, limitUsd);
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
};

type UsageMeter = {
  key: "rolling" | "weekly" | "monthly";
  label: string;
  usedUsd: number;
  limitUsd: number;
};

const getBillingReturnUrl = () => {
  const url = new URL("/billing", window.location.origin);
  return url.toString();
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

// Stripe hosted checkout lives on `checkout.stripe.com`. On the website we
// open it in a new tab; inside Stella's desktop WebContentsView the same
// click is intercepted by `setWindowOpenHandler` and routed to
// `shell.openExternal`, which opens it in the user's system browser.
// Either way the user lands back on `/billing?checkout=success` when
// Stripe finishes redirecting.
//
// Uses a synthesized anchor click rather than `window.open` because
// `window.open(url, '_blank', 'noopener,noreferrer')` returns `null` per
// the HTML spec when `noopener` is set — even on success — which made the
// previous null-check fallback navigate the current tab as well, opening
// Stripe in two tabs. The anchor-click pattern is treated as a normal
// user-initiated link, so it's never popup-blocked and only opens once.
const openStripeCheckoutUrl = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
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
  const [creditCustomAmount, setCreditCustomAmount] = useState("");
  const [creditSelectedPresetCents, setCreditSelectedPresetCents] = useState<
    number | null
  >(null);
  const [startingCredit, setStartingCredit] = useState(false);

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
  const creditOptions = useQuery(getUsageCreditPurchaseOptions, {});
  const creditStatus = useQuery(getUsageCreditStatus, {});
  const startCheckout = useAction(createCheckoutSession);
  const openPortal = useAction(createBillingPortalSession);
  const startCreditCheckout = useAction(createUsageCreditCheckoutSession);

  const planCatalog = billingStatus?.plans;
  const currentPlan = billingStatus?.plan ?? "free";
  const usage = billingStatus?.usage;
  const hasAccount = Boolean(
    billingStatus?.authenticated && !billingStatus.isAnonymous,
  );
  const isLoadingStatus = billingStatus === undefined;
  // Once a user has any active paid plan, all plan changes (upgrade,
  // downgrade, cancel) must go through Stripe's Customer Portal — the
  // backend's createCheckoutSession throws CONFLICT for active subs.
  const isActivePaidSubscriber = hasAccount && currentPlan !== "free";
  const currentPlanRank = PLAN_ORDER.indexOf(currentPlan);

  const getPlanDisplay = useCallback(
    (plan: BillingPlan) => {
      const live = planCatalog?.[plan];
      const fallback = STATIC_PLAN_DISPLAY[plan];
      return {
        label: live?.label ?? fallback.label,
        monthlyPriceCents: live?.monthlyPriceCents ?? fallback.monthlyPriceCents,
        ...(typeof live?.introFirstMonthPriceCents === "number"
          ? { introFirstMonthPriceCents: live.introFirstMonthPriceCents }
          : {}),
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

  // The custom-amount input is the source of truth for "what will Stripe
  // charge". Preset chips just write into it. We parse on submit instead of
  // on every keystroke so users can type freely (e.g. "5.5") without the
  // selected-preset state thrashing.
  const parseCustomAmountCents = useCallback(
    (raw: string): { amountCents: number; error: string | null } => {
      if (!creditOptions) {
        return { amountCents: 0, error: "Credit options are still loading." };
      }
      const trimmed = raw.trim();
      if (!trimmed) {
        return { amountCents: 0, error: "Enter an amount." };
      }
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return { amountCents: 0, error: "Enter a valid amount in dollars." };
      }
      const amountCents = Math.round(parsed * 100);
      if (amountCents < creditOptions.minAmountCents) {
        return {
          amountCents,
          error: `Minimum is ${usdFormatter.format(
            creditOptions.minAmountCents / 100,
          )}.`,
        };
      }
      if (amountCents > creditOptions.maxAmountCents) {
        return {
          amountCents,
          error: `Maximum is ${usdFormatter.format(
            creditOptions.maxAmountCents / 100,
          )}.`,
        };
      }
      return { amountCents, error: null };
    },
    [creditOptions],
  );

  const handleSelectCreditPreset = useCallback((amountCents: number) => {
    setCreditSelectedPresetCents(amountCents);
    setCreditCustomAmount((amountCents / 100).toFixed(2).replace(/\.00$/, ""));
  }, []);

  const handleStartCreditCheckout = useCallback(async () => {
    if (!hasAccount) {
      openSignInDialog();
      return;
    }
    setError(null);
    setNotice(null);
    const { amountCents, error: amountError } =
      parseCustomAmountCents(creditCustomAmount);
    if (amountError) {
      setError(amountError);
      return;
    }
    setStartingCredit(true);
    try {
      const session = await startCreditCheckout({
        amountCents,
        returnUrl: getBillingReturnUrl(),
      });
      openStripeCheckoutUrl(session.url);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to start checkout right now."));
    } finally {
      setStartingCredit(false);
    }
  }, [
    creditCustomAmount,
    hasAccount,
    parseCustomAmountCents,
    startCreditCheckout,
  ]);

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

  const usageMeters: UsageMeter[] | null =
    usage && planCatalog
      ? [
          {
            key: "rolling",
            label: `Last ${planCatalog[currentPlan].rollingWindowHours}h`,
            usedUsd: usage.rollingUsedUsd,
            limitUsd: usage.rollingLimitUsd,
          },
          {
            key: "weekly",
            label: "This week",
            usedUsd: usage.weeklyUsedUsd,
            limitUsd: usage.weeklyLimitUsd,
          },
          {
            key: "monthly",
            label: "This month",
            usedUsd: usage.monthlyUsedUsd,
            limitUsd: usage.monthlyLimitUsd,
          },
        ]
      : null;

  const renewalLabel = billingStatus?.cancelAtPeriodEnd
    ? "Cancellation pending"
    : "Next renewal";
  const renewalDetail =
    billingStatus?.currentPeriodEnd
      ? billingStatus.cancelAtPeriodEnd
        ? `Access ends ${dateFormatter.format(
            new Date(billingStatus.currentPeriodEnd),
          )}`
        : `Renews ${dateFormatter.format(
            new Date(billingStatus.currentPeriodEnd),
          )}`
      : "Managed by Stripe";

  return (
    <main className="billing-root">
      <div className="billing-shell">
        <header className="billing-hero">
          <p className="billing-eyebrow">Billing</p>
          <h1 className="billing-title">
            Choose how much <em>Stella</em>.
          </h1>
          <p className="billing-lead">
            Plans are recurring monthly. Cancel or change anytime. Prices in
            USD.
          </p>
        </header>

        {error ? (
          <p className="billing-notice billing-notice--error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? <p className="billing-notice">{notice}</p> : null}

        <section className="billing-account" aria-label="Your account">
          <div className="billing-account-head">
            <div className="billing-account-plan">
              <span className="billing-status-label">Current plan</span>
              <span className="billing-status-value">
                {isLoadingStatus ? "..." : getPlanDisplay(currentPlan).label}
              </span>
              {isActivePaidSubscriber ? (
                <span className="billing-account-renewal">{renewalLabel} · {renewalDetail}</span>
              ) : null}
            </div>
            {isActivePaidSubscriber ? (
              <div className="billing-account-actions">
                <button
                  type="button"
                  className="billing-plan-cta"
                  onClick={() => void handleOpenPortal()}
                  disabled={openingPortal}
                >
                  {openingPortal ? "Opening..." : "Manage subscription"}
                </button>
                {billingStatus && !billingStatus.cancelAtPeriodEnd ? (
                  <button
                    type="button"
                    className="billing-link-button billing-link-button--danger"
                    onClick={() => void handleOpenPortal()}
                    disabled={openingPortal}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {usageMeters ? (
            <div className="billing-account-meters">
              {usageMeters.map((meter) => (
                <div key={meter.key} className="billing-status-meter">
                  <div className="billing-status-meter-label">
                    <span>{meter.label}</span>
                    <span>{formatUsagePercent(meter.usedUsd, meter.limitUsd)}</span>
                  </div>
                  <div className="billing-meter-track">
                    <div
                      className="billing-meter-fill"
                      style={{
                        width: `${toUsagePercent(meter.usedUsd, meter.limitUsd)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="billing-plans-section" aria-label="Plans">
          <div className="billing-plans-grid">
            {PLAN_ORDER.map((plan) => {
              const display = getPlanDisplay(plan);
              const isCurrentPlan = plan === currentPlan;
              const introCents =
                plan === "go" &&
                typeof display.introFirstMonthPriceCents === "number" &&
                display.introFirstMonthPriceCents > 0 &&
                display.monthlyPriceCents >
                  display.introFirstMonthPriceCents &&
                !(isCurrentPlan && currentPlan === "go")
                  ? display.introFirstMonthPriceCents
                  : null;
              const isPaidPlan = plan !== "free";
              const isStartingThisPlan = startingPlan === plan;
              const isRecommended =
                plan === RECOMMENDED_PLAN && currentPlan !== RECOMMENDED_PLAN;
              // For active paid subscribers, label upgrades/downgrades by
              // rank so the action reads naturally and the portal route is
              // unambiguous.
              const targetRank = PLAN_ORDER.indexOf(plan);
              const changeVerb =
                isActivePaidSubscriber && isPaidPlan && !isCurrentPlan
                  ? targetRank > currentPlanRank
                    ? "Upgrade to"
                    : "Downgrade to"
                  : "Choose";
              const ctaLabel = isCurrentPlan
                ? "Current plan"
                : isStartingThisPlan
                  ? "Opening..."
                  : isActivePaidSubscriber && !isPaidPlan
                    ? "Cancel to switch"
                    : isActivePaidSubscriber && isPaidPlan
                      ? openingPortal
                        ? "Opening..."
                        : `${changeVerb} ${display.label}`
                      : !hasAccount && isPaidPlan
                        ? `Sign in for ${display.label}`
                        : isPaidPlan
                          ? `Choose ${display.label}`
                          : "Included";

              const handlePlanClick = () => {
                if (isCurrentPlan) return;
                if (isActivePaidSubscriber) {
                  // Both plan changes and free-downgrade (cancel) flow
                  // through the Stripe portal for active subscribers.
                  void handleOpenPortal();
                  return;
                }
                if (isPaidPlan) {
                  void handleStartCheckout(plan as PaidBillingPlan);
                }
              };

              const isDisabled =
                isCurrentPlan ||
                startingPlan !== null ||
                (isActivePaidSubscriber ? openingPortal : !isPaidPlan);

              return (
                <article
                  key={plan}
                  className="billing-plan"
                  data-active={isCurrentPlan || undefined}
                  data-recommended={isRecommended || undefined}
                >
                  <div className="billing-plan-name">{display.label}</div>
                  <div className="billing-plan-price-block">
                    {introCents !== null ? (
                      <>
                        <div className="billing-plan-price billing-plan-price--intro-offer">
                          <span className="billing-plan-price-value">
                            {currencyFormatter.format(introCents / 100)}
                          </span>
                          <span className="billing-plan-price-period intro">
                            first month
                          </span>
                        </div>
                        <p className="billing-plan-price-then">
                          Then{" "}
                          <strong>
                            {currencyFormatter.format(
                              display.monthlyPriceCents / 100,
                            )}
                          </strong>
                          <span aria-hidden="true">/mo</span> after that
                        </p>
                      </>
                    ) : (
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
                    )}
                  </div>
                  <p className="billing-plan-allotment">
                    {PLAN_USAGE_TAGLINE[plan]}
                  </p>
                  <ul className="billing-plan-features">
                    {getPlanFeatures(plan).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <hr className="billing-plan-rule" />
                  <button
                    type="button"
                    className={
                      "billing-plan-cta" +
                      (isCurrentPlan ? " billing-plan-cta--current" : "")
                    }
                    onClick={handlePlanClick}
                    disabled={isDisabled}
                  >
                    {ctaLabel}
                  </button>
                </article>
              );
            })}
          </div>

        </section>

        <section className="billing-credit" aria-label="Top up usage">
          <div className="billing-credit-head">
            <div className="billing-section-head">
              <h2 className="billing-section-title">Extra usage credit</h2>
              <p className="billing-section-sub">
                One-time top-up. Stella spends it automatically once your
                included monthly usage is gone, then resumes from your plan
                next month.
              </p>
            </div>
            {creditStatus?.authenticated ? (
              <div className="billing-credit-balance">
                <span className="billing-status-label">Available credit</span>
                <span className="billing-credit-balance-value">
                  {usdFormatter.format(creditStatus.balanceUsd)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="billing-credit-controls">
            {creditOptions ? (
              <div
                className="billing-credit-presets"
                role="radiogroup"
                aria-label="Preset amounts"
              >
                {creditOptions.presetAmountCents.map((amountCents) => {
                  const isSelected = creditSelectedPresetCents === amountCents;
                  return (
                    <button
                      key={amountCents}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className="billing-credit-preset"
                      data-active={isSelected || undefined}
                      onClick={() => handleSelectCreditPreset(amountCents)}
                      disabled={startingCredit}
                    >
                      {currencyFormatter.format(amountCents / 100)}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="billing-credit-form">
              <label className="billing-credit-input-wrap">
                <span className="billing-credit-input-prefix">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="billing-credit-input"
                  placeholder={
                    creditOptions
                      ? `${creditOptions.minAmountCents / 100}–${
                          creditOptions.maxAmountCents / 100
                        }`
                      : "Custom amount"
                  }
                  value={creditCustomAmount}
                  onChange={(event) => {
                    setCreditCustomAmount(event.target.value);
                    setCreditSelectedPresetCents(null);
                  }}
                  disabled={!creditOptions || startingCredit}
                  aria-label="Custom credit amount in dollars"
                />
              </label>
              <button
                type="button"
                className="billing-plan-cta billing-credit-cta"
                onClick={() => void handleStartCreditCheckout()}
                disabled={
                  !creditOptions ||
                  startingCredit ||
                  !creditCustomAmount.trim()
                }
              >
                {startingCredit
                  ? "Opening..."
                  : !hasAccount
                    ? "Sign in to top up"
                    : "Add credit"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
