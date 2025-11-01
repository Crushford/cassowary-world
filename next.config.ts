import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Ignore visual editing modules from next-sanity that require styled-components
    config.resolve.alias = {
      ...config.resolve.alias,
      'styled-components': false
    }
    return config
  }
}

export default nextConfig
