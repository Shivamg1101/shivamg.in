import { Header } from "@/components/header";
import { ContactForm } from "@/components/contact-form";
import { ScrollProgress, Reveal } from "@/components/motion";
import { Timeline } from "@/components/timeline";
import {
  AutomationsTable,
  Footer,
  Hero,
  ProjectCard,
  SectionHead,
  StackMarquee,
} from "@/components/sections";
import { getAutomations, getExperience, getProfile, getProjects } from "@/lib/queries";

export const revalidate = 60;

export default async function Home() {
  const [profile, experience, projects, automations] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getAutomations(),
  ]);

  if (!profile) {
    return (
      <main className="grid min-h-dvh place-items-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold">No profile yet</h1>
          <p className="mt-2 text-muted-foreground">
            Add a row to the <code className="rounded bg-secondary px-1.5 py-0.5">profile</code> table
            to bring this page to life.
          </p>
        </div>
      </main>
    );
  }

  const liveCount = automations.filter((a) => a.status === "live").length;
  const stats = [
    { value: String(liveCount), label: "Automations in production" },
    { value: "1,200+", label: "Domains managed" },
    { value: "13", label: "Branches automated" },
  ];

  const stack = Array.from(new Set(projects.flatMap((p) => p.stack)));
  const work = projects.filter((p) => p.kind === "project");
  const caseStudies = projects.filter((p) => p.kind === "case-study");

  return (
    <>
      <ScrollProgress />
      <Header name={profile.name} />

      <main id="main">
        <Hero profile={profile} stats={stats} />

        {stack.length > 0 && <StackMarquee items={stack} />}

        <section id="about" className="scroll-mt-20 py-18">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead kicker="About" title="From managing infrastructure to automating it" />
            <div className="grid gap-4 md:grid-cols-2">
              {profile.bio.map((para, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="card-hover h-full rounded-md border border-border bg-card p-6">
                    <p className="text-muted-foreground">{para}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="scroll-mt-20 py-18">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead kicker="Experience" title="Where I've worked" />
            <Timeline items={experience} />
          </div>
        </section>

        <section id="projects" className="scroll-mt-20 py-18">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              kicker="Projects"
              title="Selected work"
              blurb="Platforms and agents built end to end — data model, interface and deployment."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {work.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="case-studies" className="scroll-mt-20 py-18">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead
              kicker="Case Studies"
              title="How the systems work"
              blurb="A few builds in more depth — the design decisions and what they changed."
            />
            <div className="grid gap-4">
              {caseStudies.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <article className="card-hover group rounded-md border border-border bg-card p-6">
                    <h3 className="mb-2 text-[1.15rem] font-bold transition-colors group-hover:text-primary">
                      {p.title}
                    </h3>
                    <p className="text-[0.95rem] text-muted-foreground">{p.summary}</p>
                    {p.body && (
                      <p className="mt-3 border-t border-border pt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
                        {p.body}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-1.5">
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

            <div className="mt-14">
              <SectionHead kicker="Automations" title="Running in production" />
              <AutomationsTable rows={automations} />
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 py-18">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal className="rounded-md border border-border bg-card p-10 text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">Get in Touch</h2>
              <p className="mx-auto mt-3 max-w-[52ch] text-muted-foreground">
                Open to AI Engineer and AI &amp; Automation Engineer roles. Happy to walk through any
                of the systems above, live.
              </p>
              <div className="mt-7">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer profile={profile} />
    </>
  );
}
