import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v.imgi.no'
      }
    ]
  },
  // Your Next.js config here
  output: 'standalone',
  poweredByHeader: false
}

export default withPayload(nextConfig)
