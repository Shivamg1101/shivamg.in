import Link from "next/link";
import { Reveal } from "@/components/motion";
import type { Automation, Profile, Project } from "@/lib/types";

export function SectionHead({
  kicker,
  title,
  blurb,
}: {
  kicker: string;
  title: string;
  blurb?: string;
}) {
  return (
    <Reveal className="mb-9 border-b border-border pb-4">
      <div className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-primary">{kicker}</div>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
      {blurb && <p className="mt-2.5 max-w-[62ch] text-muted-foreground">{blurb}</p>}
    </Reveal>
  );
}

export function Hero({ profile, stats }: { profile: Profile; stats: { value: string; label: string }[] }) {
  return (
    <section className="pb-16 pt-20">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          {profile.available && (
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-success" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-success" />
              </span>
              {profile.available_text}
            </span>
          )}

          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl lg:text-[3.4rem]">
            <span className="animate-gradient-x bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              {profile.name}
            </span>
          </h1>

          <p className="mt-3 text-lg font-semibold text-primary sm:text-xl">{profile.headline}</p>

          {profile.tagline && (
            <p className="mt-4 max-w-[60ch] text-[1.03rem] text-muted-foreground">{profile.tagline}</p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#projects"
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Projects
            </Link>
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Download Résumé
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-11 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-hover group rounded-md border border-border bg-card px-5 py-4"
            >
              <b className="block text-[1.65rem] font-extrabold tabular-nums tracking-tight transition-colors group-hover:text-primary">
                {s.value}
              </b>
              <span className="text-[12.5px] font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function StackMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border bg-muted py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <ul className="animate-marquee flex w-max gap-9 hover:[animation-play-state:paused]">
        {doubled.map((s, i) => (
          <li key={`${s}-${i}`} className="whitespace-nowrap text-[13.5px] font-semibold text-muted-foreground">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card-hover group relative isolate overflow-hidden rounded-md border border-border bg-card p-6">
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-40"
      />
      <h3 className="mb-2 text-[1.1rem] font-bold transition-colors group-hover:text-primary">
        {project.title}
      </h3>
      <p className="text-[0.94rem] text-muted-foreground">{project.summary}</p>

      {project.stack.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded border border-border/60 bg-secondary px-2.5 py-1 text-[11.5px] font-semibold text-secondary-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {project.live_url && (
        <a
          href={project.live_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
        >
          {project.live_url.replace(/^https?:\/\//, "")}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      )}
    </article>
  );
}

export function AutomationsTable({ rows }: { rows: Automation[] }) {
  return (
    <Reveal className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              {["Workflow", "Trigger", "Systems", "Status"].map((h) => (
                <th
                  key={h}
                  className="border-b border-border bg-muted px-5 py-3 text-left text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="group transition-colors last:[&>td]:border-b-0 hover:bg-secondary">
                <td className="border-b border-border px-5 py-3 text-[13.5px] font-semibold transition-colors group-hover:text-primary">
                  {r.name}
                </td>
                <td className="border-b border-border px-5 py-3 text-[13.5px] text-muted-foreground">
                  {r.trigger}
                </td>
                <td className="border-b border-border px-5 py-3 text-[13.5px] text-muted-foreground">
                  {r.systems.join(" · ")}
                </td>
                <td className="border-b border-border px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

export function Footer({ profile }: { profile: Profile }) {
  const links = [
    profile.email && { label: "Email", href: `mailto:${profile.email}` },
    profile.github_url && { label: "GitHub", href: profile.github_url },
    profile.linkedin_url && { label: "LinkedIn", href: profile.linkedin_url },
    profile.resume_url && { label: "Résumé", href: profile.resume_url },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="mt-16 border-t border-border py-7">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4 px-6 text-[13px] text-muted-foreground">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="flex gap-5">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
