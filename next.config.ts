import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
  },
  serverRuntimeConfig: {
    internalApiToken: process.env.INTERNAL_API_TOKEN,
  },
};

export default nextConfig;