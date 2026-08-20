import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { BreadcrumbSchema, ProjectsSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { CaseStudyCard } from "@/components/case-study-card";
import { getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "Case Studies: RAG & Workflow Automation | Shivam Gupta",
  description:
    "Architecture deep dives — how the retrieval-grounded support agent and the nightly sales alerting actually work.",
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const studies = await getProjects("case-study");

  return (
    <>
      <BreadcrumbSchema trail={[{ name: "Case Studies", path: "/case-studies" }]} />
      <ProjectsSchema projects={studies} />
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-background pb-12 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div aria-hidden className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Architecture Deep Dives
            </span>
            <h1 className="mb-5 mt-6 text-4xl font-bold md:text-6xl">
              Case <span className="text-primary">Studies</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              The design decisions behind the systems that run unattended — what each one had to get
              right, and what it replaced.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- grid ---------------- */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          {studies.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No case studies published yet.
            </p>
          ) : (
            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {studies.map((p, i) => (
                <CaseStudyCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
