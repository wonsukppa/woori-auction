/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // react-pdf를 webpack 번들에서 완전 제외 — Node.js require()로 직접 로드
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        '@react-pdf/renderer',
        '@react-pdf/font',
        '@react-pdf/reconciler',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;

