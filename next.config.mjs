/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export', // Changed from 'standalone' to 'export' for static site generation
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    // Removed optimizeCss to avoid the critters dependency issue
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig