import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { PageHeader } from "@/components/sections";
import { getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Case Studies | Shivam Gupta",
  description: "A few builds in more depth — the design decisions and what they changed.",
};

export default async function CaseStudiesPage() {
  const studies = await getProjects("case-study");

  return (
    <>
      <PageHeader
        kicker="Case Studies"
        title="How the systems work"
        blurb="A few builds in more depth — the design decisions and what they changed."
      />
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4">
            {studies.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <article className="card-hover group rounded-md border border-border bg-card p-6 md:p-8">
                  <h2 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                    {p.title}
                  </h2>
                  <p className="text-muted-foreground">{p.summary}</p>
                  {p.body && (
                    <p className="mt-4 border-t border-border pt-4 leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-border/60 bg-secondary px-2.5 py-1 text-[11.5px] font-semibold text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
