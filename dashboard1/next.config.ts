import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {\
    ignoreDuringBuilds: true,```typescript file="next.config.ts"\
import type { NextConfig } from "next"
\
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The API proxy routes in app/api/proxy will handle backend communication
}
\
export default nextConfig
