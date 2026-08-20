import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The CMS and its API are behind auth, but there is no reason to
        // invite crawlers to them either.
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // llms.txt is a proposed convention; harmless if ignored.
    // Referenced here so crawlers that do look for it can find it.
    host: SITE_URL,
  };
}
