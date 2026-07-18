/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/CyberShieldAI",
  assetPrefix: "/CyberShieldAI/",
};

module.exports = nextConfig;