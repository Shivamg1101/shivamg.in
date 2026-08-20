import type { Metadata } from "next";
import { pageMeta } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";
import { BreadcrumbSchema } from "@/components/structured-data";
import { Reveal } from "@/components/motion";
import { PageHeader } from "@/components/sections";
import { getProfile } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = pageMeta({
  title: "Contact Shivam Gupta | AI & Automation Engineer",
  description:
    "Open to AI Engineer and AI & Automation Engineer roles.",
  path: "/contact",
});

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <>
      <BreadcrumbSchema trail={[{ name: "Contact", path: "/contact" }]} />
      <PageHeader
        kicker="Contact"
        title="Get in Touch"
        blurb="Open to AI Engineer and AI & Automation Engineer roles. Happy to walk through any of the systems on this site, live."
      />
      <section className="pt-10">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="grid gap-4 md:grid-cols-3">
            {[
              {
                h: "What I can help with",
                p: "Production workflow automation, retrieval-grounded agents with human escalation, and the internal platforms that make their output usable — plus the Linux hosting layer underneath.",
              },
              {
                h: "What I'm looking for",
                p: "AI Engineer and AI & Automation Engineer roles on teams with real operational load and nobody yet owning the automation layer. Remote or Delhi NCR.",
              },
              {
                h: "What happens next",
                p: "Messages reach me by email the moment you send one. I usually reply within a day, and I'm happy to screen-share any workflow or platform on this site rather than just describe it.",
              },
            ].map((c) => (
              <div key={c.h} className="card-hover rounded-xl border border-border bg-card p-6">
                <h2 className="text-base font-bold">{c.h}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.p}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-lg rounded-md border border-border bg-card p-8">
            <ContactForm />
          </Reveal>
          {profile?.email && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Or email me directly at{" "}
              <a href={`mailto:${profile.email}`} className="font-semibold text-primary hover:underline">
                {profile.email}
              </a>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
