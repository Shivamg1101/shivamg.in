import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPosts, getProfile, getProjects } from "@/lib/queries";

/**
 * Rendered per request, not cached.
 *
 * This used `revalidate = 3600`, but on Vercel the sitemap never picked up
 * content published after a deploy: a post published on 22 Sep was live, linked
 * from /blog and listed in /llms.txt, yet absent from /sitemap.xml days later,
 * whose entries all dated from the 19 Sep build. The filter here is the same
 * one /blog uses, so it was the cached output, not the query. A sitemap is
 * fetched by a handful of crawlers, three indexed reads per hit is nothing, and
 * a sitemap that lags publishing defeats its purpose — so it is dynamic.
 */
export const dynamic = "force-dynamic";

const latest = (...dates: (string | null | undefined)[]) => {
  const times = dates.filter(Boolean).map((d) => new Date(d!).getTime()).filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : undefined;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, allPosts, studies] = await Promise.all([
    getProfile(),
    getPosts(),
    getProjects("case-study"),
  ]);

  // getPosts/getProjects return every row RLS lets through; only published
  // ones are public pages (the same filter /blog and /case-studies apply).
  const posts = allPosts.filter((p) => p.published);
  const publishedStudies = studies.filter((s) => s.published);

  // lastmod is only stated where there is a real timestamp behind it. The
  // profile row drives the home, about and contact copy; the blog index changes
  // whenever a post does. projects and experience rows carry no updated_at, so
  // those pages omit lastmod rather than claim a date that means nothing.
  const profileUpdated = latest(profile?.updated_at);
  const postModified = (p: (typeof posts)[number]) => latest(p.updated_at, p.published_at);
  const blogUpdated = latest(...posts.flatMap((p) => [p.updated_at, p.published_at]));

  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1, lastModified: profileUpdated },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8, lastModified: profileUpdated },
    { url: `${SITE_URL}/experience`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/case-studies`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8, lastModified: blogUpdated },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5, lastModified: profileUpdated },
  ];

  // Each published case study is its own indexable URL.
  for (const s of publishedStudies) {
    routes.push({
      url: `${SITE_URL}/case-studies/${s.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Write-ups become real URLs as soon as they are published.
  for (const p of posts) {
    routes.push({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: "yearly",
      priority: 0.7,
      lastModified: postModified(p),
    });
  }

  return routes;
}
