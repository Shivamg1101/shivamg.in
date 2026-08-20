import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Experience, Profile, Project } from "@/lib/types";
import type { QA } from "@/components/faq";

/**
 * JSON-LD is emitted server-side from database content, so the graph never
 * drifts from what the page actually says.
 */
function Ld({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered from our own data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function PersonSchema({
  profile,
  experience,
}: {
  profile: Profile;
  experience: Experience[];
}) {
  const current = experience.find((e) => e.is_current);
  const sameAs = [profile.github_url, profile.linkedin_url].filter(Boolean);

  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: profile.name,
        url: SITE_URL,
        jobTitle: profile.headline,
        description: profile.tagline ?? undefined,
        email: profile.email ? `mailto:${profile.email}` : undefined,
        address: profile.location
          ? { "@type": "PostalAddress", addressLocality: profile.location }
          : undefined,
        sameAs: sameAs.length ? sameAs : undefined,
        worksFor: current
          ? { "@type": "Organization", name: current.company }
          : undefined,
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "Rajkiya Engineering College, Sonbhadra",
        },
        knowsAbout: [
          "Workflow automation",
          "n8n",
          "Retrieval-augmented generation",
          "LLM agents",
          "Next.js",
          "NestJS",
          "PostgreSQL",
          "Supabase",
          "Linux hosting",
        ],
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: `${SITE_NAME} — AI & Automation Engineer`,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      }}
    />
  );
}

export function BreadcrumbSchema({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Home", path: "/" }, ...trail].map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${SITE_URL}${c.path === "/" ? "" : c.path}`,
        })),
      }}
    />
  );
}

export function ProjectsSchema({ projects }: { projects: Project[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Selected work",
        itemListElement: projects.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            name: p.title,
            description: p.summary,
            url: p.live_url ?? `${SITE_URL}/projects`,
            author: { "@id": `${SITE_URL}/#person` },
            keywords: p.stack.join(", "),
          },
        })),
      }}
    />
  );
}

export function ExperienceSchema({ items }: { items: Experience[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Professional experience",
        itemListElement: items.map((x, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "OrganizationRole",
            roleName: x.title,
            startDate: x.start_date,
            endDate: x.end_date ?? undefined,
            description: x.summary ?? undefined,
            memberOf: { "@type": "Organization", name: x.company },
          },
        })),
      }}
    />
  );
}

export function FaqSchema({ faqs }: { faqs: QA[] }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
  );
}
