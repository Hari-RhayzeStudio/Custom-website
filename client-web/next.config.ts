import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rhayze.com',
        pathname: '**', // Allow all images from this domain
      },
      // Keep existing domains if any (e.g., Google storage)
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      }
    ],
  },
};

export default nextConfig;