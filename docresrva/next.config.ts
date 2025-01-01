import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['documentsdrs3.s3.eu-north-1.amazonaws.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // This disables ESLint during builds
  }
};

export default nextConfig;
