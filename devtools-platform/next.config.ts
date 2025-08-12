import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove experimental turbo config to fix React Server Components issue
  // Use stable build system instead
  transpilePackages: [],
  
  // Configure allowed dev origins to fix cross-origin warning
  async rewrites() {
    return [];
  },
  
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

export default nextConfig;
