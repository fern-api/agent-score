/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['boneyard-js'],
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
