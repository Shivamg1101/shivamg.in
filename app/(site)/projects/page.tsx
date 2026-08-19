import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { AutomationsTable, PageHeader, ProjectCard, SectionHead } from "@/components/sections";
import { getAutomations, getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects | Shivam Gupta",
  description: "Platforms and agents built end to end — data model, interface and deployment.",
};

export default async function ProjectsPage() {
  const [projects, automations] = await Promise.all([getProjects("project"), getAutomations()]);

  return (
    <>
      <PageHeader
        kicker="Projects"
        title="Selected work"
        blurb="Platforms and agents built end to end — data model, interface and deployment."
      />

      <section className="pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead kicker="Automations" title="Running in production" />
          <AutomationsTable rows={automations} />
        </div>
      </section>
    </>
  );
}
