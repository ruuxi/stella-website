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
          <nav className="store-web-tabs" aria-label="Store sections">
            <span className="store-web-tab" data-active="true">Discover</span>
            <span className="store-web-tab">Pets</span>
            <span className="store-web-tab">Emojis</span>
          </nav>
          <header className="store-web-hero">
            <p className="store-web-eyebrow">Store</p>
            <div className="store-web-hero-title-row">
              <h1 className="store-web-title">Add-ons for Stella</h1>
            </div>
          </header>
        </div>
        <div className="store-scroll">
          <div className="store-section">
            <div className="store-section-header">
              <span className="store-section-title">For You</span>
            </div>
            <SkeletonGrid count={6} />
          </div>
        </div>
      </main>
    </div>
  );
}
