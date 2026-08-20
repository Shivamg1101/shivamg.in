import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { BreadcrumbSchema, ProjectsSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { ProjectCard } from "@/components/project-card";
import { AutomationsTable, SectionHead } from "@/components/sections";
import { getAutomations, getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "AI & Automation Projects | Shivam Gupta",
  description:
    "Production automation, retrieval-grounded agents and full-stack platforms — built end to end, from data model to deployment.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const [projects, automations] = await Promise.all([getProjects(), getAutomations()]);

  return (
    <>
      <BreadcrumbSchema trail={[{ name: "Projects", path: "/projects" }]} />
      <ProjectsSchema projects={projects} />
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-background pb-12 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div aria-hidden className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Automation Portfolio
            </span>
            <h1 className="mb-5 mt-6 text-4xl font-bold md:text-6xl">
              Production-Focused <span className="text-primary">Projects</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Automation, retrieval-grounded agents and internal platforms — each one running against
              live operational data rather than a demo dataset.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- grid ---------------- */}
      <section id="projects" className="scroll-mt-20 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- automations ---------------- */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead
            kicker="Automations"
            title="Running in production"
            blurb="The workflows behind the platforms — scheduled, webhook-driven and real-time."
          />
          <AutomationsTable rows={automations} />
        </div>
      </section>
    </>
  );
}
