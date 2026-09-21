import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The service worker must never be served stale, or updates can't reach installed clients.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  // Old social-network URLs → encyclopedia URLs
  async redirects() {
    return [
      { source: "/e/:slug", destination: "/wiki/:slug", permanent: true },
      { source: "/explore", destination: "/graph", permanent: true },
      { source: "/path", destination: "/kinship", permanent: true },
      { source: "/browse", destination: "/a-z", permanent: true },
    ];
  },
};

export default nextConfig;
