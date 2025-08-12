import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
  },
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
