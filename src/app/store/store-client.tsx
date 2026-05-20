"use client";

import { Package } from "lucide-react";
import { isConvexConfigured } from "@/lib/convex-urls";
import { EmptyState } from "./components/shared";
import { StoreClientInner } from "./discover/store-discover";

export function StoreClient() {
  if (!isConvexConfigured()) {
    return (
      <main className="store-root" data-tab="discover">
        <div className="store-scroll">
          <EmptyState
            icon={<Package size={32} />}
            title="Store unavailable"
            description="Convex is not configured for this website build."
          />
        </div>
      </main>
    );
  }
  return <StoreClientInner />;
}
