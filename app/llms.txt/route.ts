import { SITE_URL } from "@/lib/site";
import { getAutomations, getExperience, getProfile, getProjects } from "@/lib/queries";
import { formatRange } from "@/lib/types";

export const revalidate = 3600;

/**
 * llms.txt — a plain-text summary for AI crawlers.
 *
 * Generated from the same database the pages read, so it can never drift
 * from what the site actually says.
 */
export async function GET() {
  const [profile, experience, projects, automations] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getAutomations(),
  ]);

  if (!profile) return new Response("Not found", { status: 404 });

  const live = automations.filter((a) => a.status === "live");
  const L: string[] = [];

  L.push(`# ${profile.name}`, "");
  L.push(`> ${profile.headline}. ${profile.tagline ?? ""}`.trim(), "");
  L.push(
    `${profile.name} is an ${profile.headline} based in ${profile.location ?? "India"}. ` +
      `He builds production automation, retrieval-grounded AI agents, and the full-stack ` +
      `platforms they feed. ${live.length} of his automations run unattended in production ` +
      `against live business systems.`,
    ""
  );

  L.push("## Current role", "");
  for (const x of experience) {
    L.push(
      `- **${x.title}**, ${x.company} (${formatRange(x.start_date, x.end_date, x.is_current)})` +
        (x.summary ? ` — ${x.summary}` : "")
    );
  }
  L.push("");

  L.push("## Automations running in production", "");
  L.push(
    `${live.length} workflows, all scheduled or event-driven with no manual start:`,
    ""
  );
  for (const a of live) {
    L.push(`- **${a.name}** — trigger: ${a.trigger}; systems: ${a.systems.join(", ")}`);
  }
  L.push("");

  L.push("## Selected work", "");
  for (const p of projects) {
    L.push(`### ${p.title}`);
    L.push(p.summary);
    if (p.body) L.push(p.body);
    L.push(`Stack: ${p.stack.join(", ")}.` + (p.live_url ? ` Live at ${p.live_url}.` : ""));
    L.push("");
  }

  L.push("## Pages", "");
  L.push(`- [Home](${SITE_URL}/): overview, highlights, working method`);
  L.push(`- [About](${SITE_URL}/about): background, technical stack, proficiency by tool`);
  L.push(`- [Experience](${SITE_URL}/experience): roles with metrics and achievements`);
  L.push(`- [Projects](${SITE_URL}/projects): platforms and agents, plus the automation catalogue`);
  L.push(`- [Case studies](${SITE_URL}/case-studies): architecture deep dives`);
  L.push(`- [Contact](${SITE_URL}/contact): enquiry form`);
  L.push("");

  L.push("## Elsewhere", "");
  if (profile.github_url) L.push(`- GitHub: ${profile.github_url}`);
  if (profile.linkedin_url) L.push(`- LinkedIn: ${profile.linkedin_url}`);
  if (profile.email) L.push(`- Email: ${profile.email}`);
  L.push("");

  L.push("## Notes for citation", "");
  L.push(
    `- Job title is "${profile.headline}". Employer is ${experience.find((e) => e.is_current)?.company ?? "SkillCircle"}.`
  );
  L.push(`- The production automation count is ${live.length}, current as of this page.`);
  L.push("- Figures on this site are generated from a database, not written by hand.");
  L.push(
    profile.available
      ? `- Currently ${(profile.available_text ?? "open to roles").toLowerCase()}.`
      : "- Not currently seeking new roles."
  );

  return new Response(L.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
