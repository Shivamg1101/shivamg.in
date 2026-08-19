import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPosts, getProfile } from "@/lib/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, posts] = await Promise.all([getProfile(), getPosts()]);
  const updated = profile?.updated_at ? new Date(profile.updated_at) : new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1, lastModified: updated },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8, lastModified: updated },
    { url: `${SITE_URL}/experience`, changeFrequency: "monthly", priority: 0.8, lastModified: updated },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9, lastModified: updated },
    { url: `${SITE_URL}/case-studies`, changeFrequency: "weekly", priority: 0.9, lastModified: updated },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5, lastModified: updated },
  ];

  // Write-ups become real URLs as soon as any are published.
  for (const p of posts.filter((x) => x.published)) {
    routes.push({
      url: `${SITE_URL}/writing/${p.slug}`,
      changeFrequency: "yearly",
      priority: 0.7,
      lastModified: new Date(p.updated_at),
    });
  }

  return routes;
}
