import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root; a stray package-lock.json in the home directory
  // otherwise makes Turbopack guess wrongly.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
