import type { NextConfig } from "next";
import createBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  analyzerMode: "json",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  // GoDaddy's authenticated preview runs the dev server on this exact host.
  allowedDevOrigins: ["xya3gs1vuu.preview.c35.airoapp.ai"],
  // Explicit gzip/brotli compression for `next start` deployments
  compress: true,
  // Keep file tracing scoped to this nested project, not the parent home lockfile.
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  trailingSlash: false,
  // Production origin is env-driven (see data/site.ts / SEO fix S-05)
  reactStrictMode: true,
  async headers() {
    const immutableAssetHeaders = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];

    return [
      { source: "/images/:path*", headers: immutableAssetHeaders },
      { source: "/models/:path*", headers: immutableAssetHeaders },
      { source: "/textures/:path*", headers: immutableAssetHeaders },
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
