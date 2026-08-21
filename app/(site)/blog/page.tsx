import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/site";
import { BreadcrumbSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { getPosts } from "@/lib/queries";
import { readingTime } from "@/lib/markdown";

export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "Blog | Shivam Gupta, AI & Automation Engineer",
  description:
    "Notes on workflow automation, retrieval-grounded agents and the infrastructure underneath — written from systems actually running in production.",
  path: "/blog",
});

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogIndexPage() {
  // getPosts returns drafts too; only published ones are public.
  const posts = (await getPosts()).filter((p) => p.published);

  return (
    <>
      <BreadcrumbSchema trail={[{ name: "Blog", path: "/blog" }]} />

      <section className="relative overflow-hidden bg-background pb-12 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div aria-hidden className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Notes from production
            </span>
            <h1 className="mb-5 mt-6 text-4xl font-bold md:text-6xl">
              The <span className="text-primary">Blog</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Workflow automation, retrieval-grounded agents, and the infrastructure underneath —
              written from systems that actually run unattended.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Nothing published yet. Drafts are in progress.
            </p>
          ) : (
            <ul className="space-y-4">
              {posts.map((p, i) => (
                <li key={p.id}>
                  <Reveal delay={Math.min(i, 6) * 0.05}>
                    <article className="group relative rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/40">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                        {formatDate(p.published_at) && (
                          <time dateTime={p.published_at ?? undefined}>{formatDate(p.published_at)}</time>
                        )}
                        <span aria-hidden>·</span>
                        <span>{readingTime(p.body)} min read</span>
                      </div>

                      <h2 className="mt-2 text-xl font-bold transition-colors group-hover:text-primary">
                        <Link href={`/blog/${p.slug}`} className="after:absolute after:inset-0">
                          {p.title}
                        </Link>
                      </h2>

                      {p.excerpt && (
                        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                          {p.excerpt}
                        </p>
                      )}

                      {p.tags?.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <li
                              key={t}
                              className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
