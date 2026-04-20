/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://fern-agent-score.vercel.app' : '',
  transpilePackages: ['boneyard-js'],
  images: {
    unoptimized: true,
  },
  experimental: {
    // afdocs is ESM-only. Marking it external prevents webpack from bundling it
    // and emitting require(), which fails for ESM. Instead Next.js leaves it as
    // a native import() which Node.js CAN handle from a CJS context.
    serverComponentsExternalPackages: ['afdocs'],
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
