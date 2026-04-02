import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better error handling
  reactStrictMode: true,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  
  // Headers are now handled in middleware.ts for better security
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here if needed
  },
  
  // Ensure proper environment handling
  env: {
    // Add any environment variables here if needed
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://voidesports.org',
  }
};

export default nextConfig;