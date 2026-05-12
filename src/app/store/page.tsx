import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { StoreClient } from "./store-client";
import "./store.css";

export const metadata: Metadata = {
  title: "Store",
  description: "Discover Stella apps, mods, and customizations.",
};

export default function StorePage() {
  return (
    <div className="stella-page">
      <SiteHeader />
      <StoreClient />
    </div>
  );
}
