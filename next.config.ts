
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb', // Example value
      allowedOrigins: ['*'], // Example value
    },
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      
      {
          protocol: 'https',
            hostname: 'encrypted-tbn0.gstatic.com', 
          },
          {
            protocol: 'https',
            hostname: 'media.falabella.com',
            pathname: '/falabellaPE/**',

          },
          {
            protocol: 'https',
            hostname: 'jmtechnology.ec',

          },
          
          {
            protocol: 'https',
            hostname: 'pcya.pe',
          pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
