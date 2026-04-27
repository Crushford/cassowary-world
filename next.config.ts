import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
