/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://fern-agent-score.vercel.app' : '',
  transpilePackages: ['boneyard-js'],
  serverExternalPackages: ['afdocs'],
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // afdocs is ESM and reads its own package.json via import.meta.url at module load.
      // Webpack bakes in the build-time path which doesn't exist at Vercel runtime.
      // Forcing it external makes Node.js resolve it from node_modules at runtime instead.
      const prev = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...prev, 'afdocs'];
    }
    return config;
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
