/** @type {import('next').NextConfig} */
const nextConfig = {
  // Convex backend doesn't need typical Next.js features
  // This is a minimal setup for Vercel deployment
  output: 'standalone',
};

module.exports = nextConfig;

