import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Disable webpack caching to prevent module resolution issues
    config.cache = false;

    return config;
  },
};

export default nextConfig;


