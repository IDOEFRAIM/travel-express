import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // Limite augmentée pour upload fichiers volumineux
    },
  },
};

export default nextConfig;
