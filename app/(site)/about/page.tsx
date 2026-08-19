import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { PageHeader, StackMarquee } from "@/components/sections";
import { getProfile, getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About | Shivam Gupta",
  description: "How I moved from running hosting infrastructure to automating it.",
};

export default async function AboutPage() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  if (!profile) return null;

  const stack = Array.from(new Set(projects.flatMap((p) => p.stack)));

  return (
    <>
      <PageHeader
        kicker="About"
        title="From managing infrastructure to automating it"
        blurb={profile.tagline ?? undefined}
      />

      <section className="py-4">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {profile.bio.map((para, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="card-hover h-full rounded-md border border-border bg-card p-6">
                  <p className="text-muted-foreground">{para}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {stack.length > 0 && (
        <div className="mt-14">
          <StackMarquee items={stack} />
        </div>
      )}
    </>
  );
}
