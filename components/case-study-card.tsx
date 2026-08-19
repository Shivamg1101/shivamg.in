"use client";

import { motion, useReducedMotion } from "framer-motion";
import { parseMetric, type Project } from "@/lib/types";

const BADGES = [
  "from-fuchsia-500 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-violet-500 to-indigo-600",
  "from-amber-400 to-orange-500",
];

const ICONS = [
  <svg key="a" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m12 2 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
  </svg>,
  <svg key="b" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>,
  <svg key="c" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" />
  </svg>,
  <svg key="d" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>,
];

const Arrow = () => (
  <svg className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export function CaseStudyCard({ project, index }: { project: Project; index: number }) {
  const reduce = useReducedMotion();
  const badge = BADGES[index % BADGES.length];
  const icon = ICONS[index % ICONS.length];

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduce ? undefined : { y: -8 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: (index % 3) * 0.08 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur-sm transition-colors duration-300 hover:border-primary/40"
    >
      {/* wash that warms the card on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${badge}`}>
            {icon}
          </div>
          {project.live_url && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          )}
        </div>

        <span className="mb-3 w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {project.category ?? "System"}
        </span>

        <h2 className="mb-3 text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-primary">
          {project.title}
        </h2>

        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

        {project.metrics.length > 0 && (
          <div className="mb-5 grid grid-cols-3 gap-2">
            {project.metrics.map((m) => {
              const { value, label } = parseMetric(m);
              return (
                <div
                  key={m}
                  className="rounded-xl border border-border/60 bg-muted/40 px-2 py-3 text-center transition-colors duration-300 group-hover:border-primary/25"
                >
                  <div className="text-[13px] font-bold leading-tight">{value}</div>
                  <div className="mt-1 text-[10.5px] text-muted-foreground">{label}</div>
                </div>
              );
            })}
          </div>
        )}

        {project.role && (
          <div className="mb-5 rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">Role</div>
            <p className="mt-1.5 text-sm leading-relaxed">{project.role}</p>
          </div>
        )}

        {project.body && (
          <p className="mb-5 border-l-2 border-primary/25 pl-4 text-[13px] leading-relaxed text-muted-foreground">
            {project.body}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-sm font-semibold">Read case study</span>
          <Arrow />
        </div>
      </div>
    </motion.article>
  );
}
