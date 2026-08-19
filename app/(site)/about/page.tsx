import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { ProfileTabs, SkillMatrix, type SkillGroup, type Tab } from "@/components/about-widgets";
import { getAutomations, getProfile, getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About | Shivam Gupta",
  description:
    "How I moved from running hosting infrastructure for 1,200+ domains to owning AI and automation — the approach, the stack, and what I optimise for.",
};

const TABS: Tab[] = [
  {
    key: "Vision",
    heading: "Vision",
    body: "I build automation that runs unattended against real operational data — student lifecycles, fee collection, telephony reporting — and the internal platforms that make its output usable by the people doing the work.",
    tags: ["Workflow design", "LLM agents", "Systems integration"],
  },
  {
    key: "Expertise",
    heading: "Expertise",
    body: "Production n8n pipelines wired into live LMS, CRM and telephony systems; retrieval-grounded agents with structured output and human escalation; and full-stack Next.js and NestJS platforms on Supabase and Postgres.",
    tags: ["n8n", "RAG", "Full-stack", "Postgres"],
  },
  {
    key: "Approach",
    heading: "Approach",
    body: "Read-only dry runs and diagnostic probes before anything touches production. Write operations stay disabled until every input is verified. Automation running unattended against real student records has to be boring and correct.",
    tags: ["Dry runs", "Verification", "Observability"],
  },
];

const PILLARS = [
  {
    title: "Automation against live systems",
    body: "Ten workflows running on daily, scheduled and real-time triggers across Edmingle, Google Workspace, MCube telephony and WHMCS — no sandbox, no manual kick-off.",
  },
  {
    title: "Agents that refuse to guess",
    body: "Retrieval-grounded answers with structured output and an explicit escalation flag, so refunds, complaints and account issues route to a human instead of receiving an invented reply.",
  },
  {
    title: "Platforms the output lands in",
    body: "Next.js and NestJS applications on Supabase — job portal, admission dashboard, sales portal — owned from data model and migrations through interface and deployment.",
  },
];

const SIGNALS = [
  "Correctness over cleverness",
  "Unattended operation",
  "Exception-only alerting",
  "Verified inputs",
  "Reversible changes",
  "Documented behaviour",
  "Zero manual kick-off",
];

const STEPS = [
  "Sit with whoever does the task today and trace it end to end, including the steps nobody wrote down.",
  "Build a read-only version first: probes confirm the data is shaped the way I think it is.",
  "Enable writes against a small slice, verify the output by hand, then widen.",
  "Ship on a schedule or webhook, report what it did, and escalate only the exceptions.",
];

const SNAPSHOT = [
  { label: "Primary focus", body: "Production automation and retrieval-grounded agents against live business systems." },
  { label: "Work style", body: "Documentation-led. PRD, data model and engineering rules written alongside the build." },
  { label: "Collaboration", body: "Close to the people doing the manual work, because that is where the requirements actually are." },
  { label: "Best fit", body: "Teams with real operational load and no one owning the automation layer yet." },
];

const GROUPS: SkillGroup[] = [
  {
    key: "AI & Automation",
    skills: [
      { name: "n8n", level: 92, projects: 10, note: "Ten production workflows on scheduled, webhook and real-time triggers." },
      { name: "RAG pipelines", level: 78, projects: 1, note: "Qdrant vector store, Gemini embeddings, 800/80 chunking, top-8 retrieval." },
      { name: "LLM agents", level: 76, projects: 3, note: "Structured output with explicit human-escalation branches." },
      { name: "OpenAI / Gemini", level: 74, projects: 4, note: "Ad-creative generation and grounded support responses." },
      { name: "LangChain", level: 68, projects: 1, note: "Retrieval chain and output parsing inside the support agent." },
      { name: "Pabbly / AiSensy", level: 70, projects: 2, note: "Fee reminders and outbound messaging before the n8n migration." },
    ],
  },
  {
    key: "Full-Stack",
    skills: [
      { name: "Next.js", level: 85, projects: 4, note: "App Router, server components, Vercel deployment." },
      { name: "TypeScript", level: 82, projects: 5, note: "End-to-end across web apps, APIs and shared packages." },
      { name: "NestJS", level: 74, projects: 1, note: "Job portal API with auth, queues and transactional mail." },
      { name: "React", level: 84, projects: 5, note: "Dashboards with role-based views and live data." },
      { name: "Express", level: 72, projects: 2, note: "JWT-authenticated services over Sheets and CRM data." },
      { name: "Tailwind CSS", level: 86, projects: 5, note: "Design-token driven UI across every recent build." },
    ],
  },
  {
    key: "Data & Backend",
    skills: [
      { name: "PostgreSQL", level: 78, projects: 3, note: "Schema design across 30+ migrations on the admission platform." },
      { name: "Supabase", level: 84, projects: 3, note: "Postgres, Auth, Storage and row-level security." },
      { name: "Redis / BullMQ", level: 62, projects: 1, note: "Background jobs and queued mail on the job portal." },
      { name: "Google Sheets API", level: 88, projects: 8, note: "The de-facto data layer behind most operational workflows." },
      { name: "REST APIs", level: 80, projects: 6, note: "Edmingle, Meritto, MCube, WHMCS and Google Business Profile." },
      { name: "Qdrant", level: 70, projects: 1, note: "Vector store behind the brochure retrieval corpus." },
    ],
  },
  {
    key: "Infrastructure",
    skills: [
      { name: "Linux hosting", level: 86, projects: 1, note: "Shared and VPS environments across 1,200+ domains." },
      { name: "cPanel / WHM", level: 90, projects: 1, note: "Daily operation, provisioning and incident response." },
      { name: "DNS & SSL", level: 84, projects: 1, note: "Records, propagation and certificate lifecycle at scale." },
      { name: "Cloudflare", level: 72, projects: 1, note: "Proxying, caching and mitigation during downtime incidents." },
      { name: "Docker", level: 64, projects: 2, note: "Local parity and containerised services." },
      { name: "Vercel / Railway", level: 78, projects: 4, note: "Production deployment for web apps and APIs." },
    ],
  },
];

const EXPERTISE = [
  {
    title: "Workflow Automation",
    tech: ["n8n", "Cron", "Webhooks", "Google Workspace"],
    wins: [
      "Ten workflows live on daily, scheduled and real-time triggers",
      "Full LMS student lifecycle automated across 13 branches",
      "Zero manual kick-off — every run is scheduled or event-driven",
    ],
  },
  {
    title: "Retrieval-Grounded Agents",
    tech: ["Qdrant", "Gemini", "LangChain", "Structured output"],
    wins: [
      "Answers constrained to retrieved passages, never invented",
      "Explicit escalation flag routes refunds and complaints to a human",
      "800/80 chunking with top-8 retrieval over the brochure corpus",
    ],
  },
  {
    title: "Systems Integration",
    tech: ["REST", "OAuth 2.0", "Chrome extensions", "WHMCS"],
    wins: [
      "Edmingle, Meritto CRM, MCube telephony and WHMCS wired together",
      "Chrome extension feeding a webhook receiver with deduplication",
      "Billing data piped into Sheets for revenue reporting",
    ],
  },
  {
    title: "Operational Alerting",
    tech: ["MCube API", "Google Sheets", "Gmail"],
    wins: [
      "Role-specific call targets computed nightly and adjusted per walk-in",
      "Only below-target agents emailed, with their manager copied",
      "Replaced a manual nightly spreadsheet review entirely",
    ],
  },
  {
    title: "Full-Stack Platforms",
    tech: ["Next.js", "NestJS", "Supabase", "BullMQ"],
    wins: [
      "Three-sided job marketplace live at job.skillcircle.in",
      "Role-based admission platform with SLA timers and approval gates",
      "Postgres schema designed across 30+ migrations",
    ],
  },
  {
    title: "Hosting Infrastructure",
    tech: ["Linux", "cPanel / WHM", "DNS", "BitNinja"],
    wins: [
      "1,200+ active domains across shared and VPS environments",
      "Downtime diagnosed and resolved to restore uptime",
      "The layer everything else I build depends on",
    ],
  },
];

export default async function AboutPage() {
  const [profile, projects, automations] = await Promise.all([
    getProfile(),
    getProjects(),
    getAutomations(),
  ]);
  if (!profile) return null;

  const live = automations.filter((a) => a.status === "live").length;
  const heroStats = [
    { value: String(live), label: "Automations in production" },
    { value: "13", label: "Branches automated" },
    { value: "1,200+", label: "Domains managed" },
    { value: String(projects.length), label: "Platforms shipped" },
  ];
  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden bg-background pb-14 pt-16 dark:bg-black">
        <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div aria-hidden className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              AI &amp; Automation{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Engineer
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Building production automation, retrieval-grounded agents, and the internal platforms
              they feed.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm md:p-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-lg font-extrabold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold">{profile.name}</div>
                  <div className="text-sm font-semibold text-primary">{profile.headline}</div>
                  {profile.available && (
                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-success">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      {profile.available_text}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <ProfileTabs tabs={TABS} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((s) => (
              <div key={s.label} className="card-hover group rounded-xl border border-border bg-card p-5 text-center">
                <div className="text-2xl font-extrabold tabular-nums transition-colors group-hover:text-primary">
                  {s.value}
                </div>
                <div className="mt-1 text-[12px] font-medium text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- the thinking ---------------- */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <span className="inline-flex rounded-full border border-primary/25 bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
              Detailed context
            </span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              The thinking behind my{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                automation work
              </span>
            </h2>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              {profile.bio[0]}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="grid content-start gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                {PILLARS.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.06}>
                    <div className="card-hover h-full rounded-xl border border-border bg-card p-5">
                      <h3 className="text-[15px] font-bold">{p.title}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Reveal>
                  <div className="h-full rounded-xl border border-border bg-card p-5">
                    <h3 className="text-[15px] font-bold">Signals I optimise for</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {SIGNALS.map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-border/60 bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.06}>
                  <div className="h-full rounded-xl border border-border bg-card p-5">
                    <h3 className="text-[15px] font-bold">How a build actually runs</h3>
                    <ol className="mt-4 grid gap-3">
                      {STEPS.map((s, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-[13px] leading-relaxed text-muted-foreground">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Reveal>
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="h-full rounded-xl border border-border bg-gradient-to-b from-primary/5 to-transparent p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Engagement snapshot
                </span>
                <h3 className="mt-2 text-[15px] font-bold">How I create leverage</h3>
                <dl className="mt-5 grid gap-4">
                  {SNAPSHOT.map((s) => (
                    <div key={s.label}>
                      <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </dt>
                      <dd className="mt-1 text-[13px] leading-relaxed">{s.body}</dd>
                    </div>
                  ))}
                </dl>
                {profile.available && (
                  <div className="mt-5 rounded-lg border border-success/30 bg-success/10 p-3">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-success">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      {profile.available_text}
                    </div>
                    <p className="mt-1.5 text-[12px] text-muted-foreground">
                      Happy to walk through any workflow or platform on this site, live.
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- education & languages ---------------- */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="card-hover h-full rounded-xl border border-border bg-card p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Academic foundation
                </span>
                <h2 className="mt-2 text-xl font-bold">Education</h2>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Degree</dt>
                    <dd className="mt-1 text-sm font-semibold">B.Tech, Electrical Engineering</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Institution</dt>
                    <dd className="mt-1 text-sm font-semibold">Rajkiya Engineering College, Sonbhadra</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Timeline</dt>
                    <dd className="mt-1 text-sm font-semibold tabular-nums">2020 – 2024</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">Before that</dt>
                    <dd className="mt-1 text-sm font-semibold">Intermediate, Science · 2018 – 2020</dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="card-hover h-full rounded-xl border border-border bg-card p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Communication
                </span>
                <h2 className="mt-2 text-xl font-bold">Languages</h2>
                <ul className="mt-5 grid gap-4">
                  {[
                    { l: "Hindi", v: "Native", w: 100 },
                    { l: "English", v: "Professional", w: 85 },
                  ].map((x) => (
                    <li key={x.l}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold">{x.l}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">{x.v}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500"
                          style={{ width: `${x.w}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- technical stack ---------------- */}
      <section id="tech-stack" className="scroll-mt-20 border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Technical{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Stack
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Technologies and tools I use to build production systems.
            </p>
          </Reveal>

          <div className="mt-10">
            <SkillMatrix groups={GROUPS} />
          </div>
        </div>
      </section>

      {/* ---------------- expertise ---------------- */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              AI &amp; Automation{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Expertise
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Focused on production automation, grounded agents and the systems they integrate with.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EXPERTISE.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.06}>
                <article className="card-hover group h-full rounded-xl border border-border bg-card p-6">
                  <h3 className="text-[17px] font-bold transition-colors group-hover:text-primary">
                    {e.title}
                  </h3>

                  <div className="mt-4">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                      Technologies
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {e.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-border/60 bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                      Key achievements
                    </div>
                    <ul className="mt-2 grid gap-2">
                      {e.wins.map((w) => (
                        <li key={w} className="flex gap-2.5">
                          <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
                          <span className="text-[13px] leading-relaxed text-muted-foreground">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- cta ---------------- */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-blue-500/5 p-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to Build Something{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                That Runs Itself?
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Let&rsquo;s talk about the manual work you&rsquo;d rather not be doing next quarter.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Let&rsquo;s Collaborate
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
