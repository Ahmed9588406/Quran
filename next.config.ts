import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/fatwas/my/pending',
        destination: 'http://192.168.1.29:8080/api/v1/fatwas/my/pending',
      },
      {
        source: '/api/v1/fatwas/my/rejected',
        destination: 'http://192.168.1.29:8080/api/v1/fatwas/my/rejected',
      },
    ];
  },
};

export default nextConfig;
