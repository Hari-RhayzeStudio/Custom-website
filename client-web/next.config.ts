import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep this to ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // ❌ REMOVE the 'eslint' block from here completely
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rhayze.com',
        pathname: '**', 
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      }
    ],
  },
};

export default nextConfig;