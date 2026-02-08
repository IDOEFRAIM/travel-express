const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = withPWA({
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  // Configuration explicite pour satisfaire Turbopack (Next.js 16)
  // Cela confirme que nous acceptons d'utiliser Webpack config (de next-pwa) avec Turbopack
  turbopack: {},
});

module.exports = nextConfig;
