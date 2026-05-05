/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Use the default output so API routes work on Cloudflare Pages
  output: 'standalone',
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Add this to help with hydration issues
  compiler: {
    styledComponents: true,
  },
}

export default nextConfig