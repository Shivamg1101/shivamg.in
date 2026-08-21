import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/site";
import { BreadcrumbSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { getProject } from "@/lib/queries";
import { parseMetric } from "@/lib/types";

/**
 * Rendered on demand and cached for 60s. Deliberately no generateStaticParams:
 * the Supabase server client reads cookies, which is unavailable at build time,
 * and ISR gives the same result without a build-time database round trip.
 */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getProject(slug);
  if (!study) {
    return pageMeta({
      title: "Case study not found | Shivam Gupta",
      description: "This case study does not exist or is no longer published.",
      path: `/case-studies/${slug}`,
    });
  }

  return pageMeta({
    title: `${study.title} — Case Study | Shivam Gupta`,
    description: study.summary,
    path: `/case-studies/${study.slug}`,
  });
}

/** Blank-line-separated prose, rendered as real paragraphs. */
function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        // A line ending in ":" introduces the block under it — render as a lead-in.
        if (b.length < 90 && b.endsWith(":")) {
          return (
            <h2 key={i} className="pt-3 text-lg font-semibold text-foreground">
              {b.replace(/:$/, "")}
            </h2>
          );
        }
        return (
          <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
            {b}
          </p>
        );
      })}
    </div>
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getProject(slug);
  if (!study || !study.published || study.kind !== "case-study") notFound();

  const metrics = (study.metrics ?? []).map(parseMetric);

  return (
    <>
      <BreadcrumbSchema
        trail={[
          { name: "Case Studies", path: "/case-studies" },
          { name: study.title, path: `/case-studies/${study.slug}` },
        ]}
      />

      <article className="relative overflow-hidden bg-background pb-20 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6">
          <Reveal>
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              All case studies
            </Link>

            {study.category && (
              <div className="mt-6 text-[12.5px] font-bold uppercase tracking-[0.1em] text-primary">
                {study.category}
              </div>
            )}

            <h1 className="mt-3 text-3xl font-bold md:text-5xl">{study.title}</h1>

            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{study.summary}</p>

            {study.role && (
              <p className="mt-4 border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">My role: </span>
                {study.role}
              </p>
            )}
          </Reveal>

          {metrics.length > 0 && (
            <Reveal delay={0.05}>
              <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-border/60 bg-card/60 p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {m.label}
                    </dt>
                    <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          {study.body && (
            <Reveal delay={0.1}>
              <div className="mt-12 border-t border-border pt-10">
                <Prose text={study.body} />
              </div>
            </Reveal>
          )}

          {study.features?.length > 0 && (
            <Reveal delay={0.15}>
              <div className="mt-10">
                <h2 className="mb-4 text-lg font-semibold">What it had to get right</h2>
                <ul className="space-y-3">
                  {study.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {study.stack?.length > 0 && (
            <Reveal delay={0.2}>
              <div className="mt-10 border-t border-border pt-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Built with
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {study.stack.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {(study.repo_url || study.live_url) && (
            <Reveal delay={0.25}>
              <div className="mt-10 flex flex-wrap gap-3">
                {study.repo_url && (
                  <a
                    href={study.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50"
                  >
                    View the code
                  </a>
                )}
                {study.live_url && (
                  <a
                    href={study.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50"
                  >
                    See it live
                  </a>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.3}>
            <div className="mt-14 rounded-2xl border border-border bg-card/60 p-6 text-center">
              <p className="text-[15px] text-muted-foreground">
                Want something like this built?
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
