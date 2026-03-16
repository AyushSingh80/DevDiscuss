import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Appwrite Cloud — used for file previews and avatar initials
        protocol: "https",
        hostname: "fra.cloud.appwrite.io",
        pathname: "/**",
      },
      {
        // Simple Icons CDN — used by the icon cloud on the hero
        protocol: "https",
        hostname: "cdn.simpleicons.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
