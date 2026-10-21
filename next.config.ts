import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Request photos are uploaded through a server action.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
