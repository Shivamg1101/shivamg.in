import { Reveal } from "@/components/motion";
import { SITE_URL } from "@/lib/site";

/**
 * Answer-engine content: question-shaped headings with answers that stand
 * alone. An engine lifts a single passage, so each answer has to make sense
 * without the ones around it — hence the repeated proper nouns.
 */
export type QA = { q: string; a: string };

export const FAQS: QA[] = [
  {
    q: "Who is Shivam Gupta?",
    a: "Shivam Gupta is an AI & Automation Engineer based in Noida, India. He builds production workflow automation, retrieval-grounded AI agents, and the full-stack platforms those systems feed. He works at SkillCircle, where he joined as an IT Executive in February 2025 managing hosting for 1,200+ domains, and moved into the AI & Automation Engineer role in January 2026 after the automations he built became core operations.",
  },
  {
    q: "What does Shivam Gupta automate?",
    a: "Shivam Gupta runs ten automations in production at SkillCircle. They cover the LMS student lifecycle across 13 branches — daily onboarding provisioning and scheduled archival — plus fee-reminder emails, real-time certificate generation and delivery, Canva seat approvals, and a nightly sales-performance alert that joins counsellor rosters, walk-in logs and live MCube telephony data. Every one runs on a schedule or a webhook with no manual start.",
  },
  {
    q: "How does Shivam Gupta's RAG support agent work?",
    a: "The agent answers inbound support queries from SkillCircle's brochure corpus. The documents are chunked at 800 tokens with 80 tokens of overlap into a Qdrant vector store using Gemini embeddings, and the top eight passages are retrieved per query. The model is constrained to answer only from those retrieved passages and returns a structured object containing both the reply and an escalation flag, so refunds, complaints and account-specific questions route to a human instead of receiving an invented answer.",
  },
  {
    q: "What is Shivam Gupta's tech stack?",
    a: "Shivam Gupta works primarily in n8n for workflow automation, with Qdrant, Gemini and LangChain for retrieval-grounded agents. On the application side he uses TypeScript with Next.js and NestJS, backed by Supabase and PostgreSQL, with Redis and BullMQ for queued work. He also runs the infrastructure underneath: Linux hosting, cPanel and WHM, DNS, SSL and Cloudflare across more than 1,200 domains.",
  },
  {
    q: "How does Shivam Gupta approach building automation?",
    a: "Shivam Gupta builds automation in three stages. First he traces the manual process end to end with whoever performs it today, including the steps nobody documented. Then he builds a read-only version, using diagnostic probes to confirm the data is shaped as expected while write operations stay disabled. Only once inputs are verified does he enable writes against a small slice, check the output by hand, then widen. Finished systems run unattended and report only exceptions.",
  },
  {
    q: "Is Shivam Gupta available for hire?",
    a: `Yes. Shivam Gupta is open to AI Engineer and AI & Automation Engineer roles, remote or in Delhi NCR. He can be contacted through the form at ${SITE_URL}/contact, and his work is documented at ${SITE_URL}/projects with architecture write-ups at ${SITE_URL}/case-studies.`,
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-border py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-10 text-center">
          <div className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-primary">
            Questions
          </div>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Common{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
        </Reveal>

        <div className="mx-auto grid max-w-3xl gap-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              {/* <details> keeps every answer in the served HTML, so crawlers
                  read it whether or not the panel is open. */}
              <details className="group rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-semibold [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[15px] font-semibold transition-colors group-hover:text-primary">
                    {f.q}
                  </h3>
                  <span className="grid h-6 w-6 flex-none place-items-center rounded-full border border-border text-muted-foreground transition-transform duration-300 group-open:rotate-45">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="border-t border-border/60 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
