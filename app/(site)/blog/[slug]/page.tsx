import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta, SITE_URL } from "@/lib/site";
import { BreadcrumbSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { getPost } from "@/lib/queries";
import { Markdown, readingTime } from "@/lib/markdown";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) {
    return pageMeta({
      title: "Post not found | Shivam Gupta",
      description: "This post does not exist or is not published.",
      path: `/blog/${slug}`,
    });
  }

  return pageMeta({
    title: `${post.title} | Shivam Gupta`,
    description: post.excerpt ?? post.body.slice(0, 155).replace(/\s+\S*$/, "") + "…",
    path: `/blog/${post.slug}`,
  });
}

/**
 * BlogPosting, emitted from the same row the page renders, so the structured
 * data cannot drift from the visible content.
 */
function PostSchema({
  title,
  excerpt,
  slug,
  publishedAt,
  updatedAt,
}: {
  title: string;
  excerpt: string | null;
  slug: string;
  publishedAt: string | null;
  updatedAt: string;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: excerpt ?? undefined,
          datePublished: publishedAt ?? undefined,
          dateModified: updatedAt,
          author: { "@id": `${SITE_URL}/#person` },
          publisher: { "@id": `${SITE_URL}/#person` },
          mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  // Drafts must 404 publicly — the CMS is the only place they are visible.
  if (!post || !post.published) notFound();

  const published = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <BreadcrumbSchema
        trail={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <PostSchema
        title={post.title}
        excerpt={post.excerpt}
        slug={post.slug}
        publishedAt={post.published_at}
        updatedAt={post.updated_at}
      />

      <article className="relative overflow-hidden bg-background pb-20 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-2xl px-6">
          <Reveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              All posts
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              {published && <time dateTime={post.published_at ?? undefined}>{published}</time>}
              <span aria-hidden>·</span>
              <span>{readingTime(post.body)} min read</span>
            </div>

            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>

            {post.excerpt && (
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}

            {post.tags?.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 border-t border-border pt-10">
              <Markdown source={post.body} />
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-14 rounded-2xl border border-border bg-card/60 p-6 text-center">
              <p className="text-[15px] text-muted-foreground">
                Building something that needs to run unattended?
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </article>
    </>
  );
}
