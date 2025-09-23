import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better error handling
  reactStrictMode: true,
  
  // Optimize images
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  
  // Add headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ],
      },
    ];
  },
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here if needed
  },
  
  // Ensure proper environment handling
  env: {
    // Add any environment variables here if needed
  }
};

export default nextConfig;