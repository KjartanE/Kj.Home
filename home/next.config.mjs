/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true // Temporarily ignore TypeScript errors during build
  },
  output: "standalone",
  experimental: {
    serverActions: true
  }
};

export default nextConfig;
