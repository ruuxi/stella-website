import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { BillingClient } from "./billing-client";
import "./billing.css";

export const metadata: Metadata = {
  title: "Billing",
  description:
    "Choose a Stella plan. Every plan includes the full Stella experience; higher tiers increase monthly usage.",
  alternates: { canonical: "/billing" },
};

export default function BillingPage() {
  return (
    <div className="stella-page">
      <SiteHeader />
      <BillingClient />
    </div>
  );
}
