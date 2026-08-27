import type { NextConfig } from "next";
import path from "node:path";

// Blog covers are served from Supabase Storage. next/image refuses any remote
// host that is not listed here, so without this every post with a cover throws
// at render time rather than degrading to a missing image.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Pin the workspace root; a stray package-lock.json in the home directory
  // otherwise makes Turbopack guess wrongly.
  turbopack: { root: path.resolve(__dirname) },

  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
