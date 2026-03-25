/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/agent-score',
        destination: '/',
      },
      {
        source: '/agent-score/:path*',
        destination: '/:path*',
      },
    ];
  },
}

export default nextConfig
