import { SiteHeader } from "@/components/site-header";
import { SkeletonGrid } from "./components/shared";
import "./store.css";

/**
 * Route-level loading shell. Renders the store layout chrome with a
 * content-shaped skeleton grid so the page never paints empty before
 * Convex resolves. Embedded desktop webview hides the marketing
 * header via `data-embedded="true"`.
 */
export default function StoreLoading() {
  return (
    <div className="stella-page">
      <SiteHeader />
      <main className="store-root" data-tab="discover" aria-busy="true">
        <div className="store-web-shell">
          <header className="store-web-header">
            <nav className="store-web-tabs" aria-label="Store sections">
              <span className="store-web-tab" data-active="true">Discover</span>
              <span className="store-web-tab">Pets</span>
              <span className="store-web-tab">Emojis</span>
            </nav>
          </header>
        </div>
        <div className="store-scroll">
          <div className="store-section">
            <SkeletonGrid count={6} />
          </div>
        </div>
      </main>
    </div>
  );
}
