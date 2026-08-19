import type { Metadata } from "next";
import { PageHeader } from "@/components/sections";
import { Timeline } from "@/components/timeline";
import { getExperience } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Experience | Shivam Gupta",
  description: "Roles, responsibilities and what each one shipped.",
};

export default async function ExperiencePage() {
  const experience = await getExperience();

  return (
    <>
      <PageHeader
        kicker="Experience"
        title="Where I've worked"
        blurb="Two roles at the same company — the second one created because of what the first one automated."
      />
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <Timeline items={experience} />
        </div>
      </section>
    </>
  );
}
