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

  // Vercel already sends Strict-Transport-Security; everything else was absent.
  //
  // The admin sign-in page was framable by any origin, which is the setup for a
  // clickjacking attack: overlay an invisible copy of it on a page the target is
  // persuaded to visit and harvest what they type. frame-ancestors is the modern
  // control and X-Frame-Options is kept alongside it for older agents.
  //
  // Deliberately not here: a script-src content security policy. Doing that
  // properly needs per-request nonces threaded through the proxy into Next's own
  // inline bootstrap scripts, and a wrong one blanks the site rather than
  // failing visibly. It is worth doing as its own change, verified against a
  // preview deployment — not slipped in while the site is being promoted.
  async headers() {
    const baseline = [
      // Stop browsers from second-guessing declared content types, which is how
      // an uploaded file that claims to be an image gets run as script.
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Send the full URL only to ourselves; other origins see the origin alone,
      // so admin paths and query strings do not leak in Referer headers.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Nothing here uses these, so decline them rather than leaving them open
      // to anything later embedded in the page.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
    ];

    return [
      { source: "/:path*", headers: baseline },
      {
        // The CMS is never legitimately embedded, anywhere.
        source: "/admin/:path*",
        headers: [
          ...baseline.filter((h) => h.key !== "X-Frame-Options" && h.key !== "Content-Security-Policy"),
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Keep the CMS out of search results and out of shared caches.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
