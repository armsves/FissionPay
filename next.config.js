/** @type {import('next').NextConfig} */

const path = require('path');

module.exports = {
  reactStrictMode: true,
  // Path aliases are handled by tsconfig.json, but keeping webpack config for compatibility
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  // Add empty turbopack config to silence the error when using webpack
  turbopack: {},
};
