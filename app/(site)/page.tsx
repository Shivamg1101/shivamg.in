import type { Metadata } from "next";
import { ProjectsSchema } from "@/components/structured-data";
import { Hero } from "@/components/hero";
import { Bento } from "@/components/bento";
import { Approach } from "@/components/approach";
import { Stats, StackMarquee } from "@/components/sections";
import { getAutomations, getProfile, getProjects } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/", type: "website" },
  title: "Shivam Gupta | AI & Automation Engineer",
  description:
    "Ten automations running in production, a retrieval-grounded support agent, and the full-stack platforms underneath them.",
};

export default async function Home() {
  const [profile, projects, automations] = await Promise.all([
    getProfile(),
    getProjects(),
    getAutomations(),
  ]);

  if (!profile) {
    return (
      <div className="grid min-h-dvh place-items-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold">No profile yet</h1>
          <p className="mt-2 text-muted-foreground">
            Add a row to the <code className="rounded bg-secondary px-1.5 py-0.5">profile</code> table
            to bring this page to life.
          </p>
        </div>
      </div>
    );
  }

  const liveCount = automations.filter((a) => a.status === "live").length;
  const stats = [
    { value: String(liveCount), label: "Automations in production" },
    { value: "1,200+", label: "Domains managed" },
    { value: "13", label: "Branches automated" },
  ];
  const stack = Array.from(new Set(projects.flatMap((p) => p.stack)));

  return (
    <>
      <ProjectsSchema projects={projects} />
      <Hero profile={profile} />
      <Bento />
      <Stats stats={stats} />
      {stack.length > 0 && <StackMarquee items={stack} />}
      <Approach />
    </>
  );
}
