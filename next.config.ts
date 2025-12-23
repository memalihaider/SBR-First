import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static export to allow dynamic routes
  // output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
