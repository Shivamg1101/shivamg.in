import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/motion";
import { PageHeader } from "@/components/sections";
import { getProfile } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact | Shivam Gupta",
  description: "Open to AI Engineer and AI & Automation Engineer roles.",
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Get in Touch"
        blurb="Open to AI Engineer and AI & Automation Engineer roles. Happy to walk through any of the systems on this site, live."
      />
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
