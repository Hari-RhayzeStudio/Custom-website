import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep this to ignore TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ❌ REMOVED the 'eslint' block entirely
  
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