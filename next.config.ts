import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
