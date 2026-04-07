/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://fern-agent-score.vercel.app' : '',
  transpilePackages: ['boneyard-js'],
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'labs.buildwithfern.com' }],
        destination: 'https://buildwithfern.com/agent-score/:path*',
        permanent: true,
      },
    ];
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
