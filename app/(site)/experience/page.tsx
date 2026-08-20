import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { BreadcrumbSchema, ExperienceSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { Timeline } from "@/components/timeline";
import { getAutomations, getExperience } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "Experience | Shivam Gupta, AI & Automation Engineer",
  description:
    "Automation, AI and infrastructure roles — what each one shipped, and the metrics behind them.",
  path: "/experience",
});

const TrendUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default async function ExperiencePage() {
  const [experience, automations] = await Promise.all([getExperience(), getAutomations()]);
  const live = automations.filter((a) => a.status === "live").length;

  const impact = [
    { value: String(live), label: "Automations in production" },
    { value: "13", label: "Branches automated" },
    { value: "1,200+", label: "Domains managed" },
    { value: "1", label: "Role created for the work" },
  ];

  return (
    <>
      <BreadcrumbSchema trail={[{ name: "Experience", path: "/experience" }]} />
      <ExperienceSchema items={experience} />
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-background pb-10 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div aria-hidden className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              Automation &amp;{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Infrastructure
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Production workflows, retrieval-grounded agents, internal platforms and the hosting
              layer underneath them — across two roles at the same company.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- timeline ---------------- */}
      <section className="pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <Timeline items={experience} />
        </div>
      </section>

      {/* ---------------- closing impact block ---------------- */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center">
            <div className="flex items-center justify-center gap-2">
              <TrendUp />
              <h2 className="text-xl font-bold sm:text-2xl">Systems With Measurable Impact</h2>
            </div>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Each role sharpened the same instinct — find the work being done by hand, and replace
              it with something that runs unattended and reports only the exceptions.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impact.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="card-hover group h-full rounded-xl border border-border bg-card p-5 text-center">
                  <div className="text-2xl font-extrabold tabular-nums transition-colors group-hover:text-primary">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-muted-foreground">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
