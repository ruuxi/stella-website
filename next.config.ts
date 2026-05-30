import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Serve AVIF first (smallest), then WebP, then fall back to the source.
    formats: ["image/avif", "image/webp"],
    // Whitelist the quality levels used via the `quality` prop (default is [75]).
    qualities: [75, 82],
    // Optimized variants are content-addressed and effectively immutable;
    // cache them aggressively at the CDN/edge.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
