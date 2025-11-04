import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'localhost:3000', '192.168.21.241', '192.168.21.241:3000'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.21.241',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;