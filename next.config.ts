import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["tile.openstreetmap.org"],
  },
  eslint: {
    // Ignorer les erreurs ESLint à la compilation
    ignoreDuringBuilds: true,
  },
  // Ignorer également les erreurs TypeScript
  typescript: {
    // Ignorer les erreurs TypeScript à la compilation
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
