"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/types";

/** Cover treatments, cycled by index so every card differs. */
const COVERS = [
  { panel: "from-amber-400/30 via-yellow-500/25 to-amber-500/30", badge: "from-amber-400 to-yellow-400" },
  { panel: "from-fuchsia-500/30 via-purple-500/25 to-pink-500/30", badge: "from-fuchsia-500 to-pink-500" },
  { panel: "from-emerald-400/30 via-green-500/25 to-teal-500/30", badge: "from-emerald-400 to-green-500" },
  { panel: "from-cyan-400/30 via-sky-500/25 to-blue-500/30", badge: "from-cyan-400 to-sky-500" },
  { panel: "from-violet-500/30 via-indigo-500/25 to-blue-600/30", badge: "from-violet-500 to-indigo-600" },
  { panel: "from-orange-400/30 via-rose-500/25 to-red-500/30", badge: "from-orange-400 to-rose-500" },
];

const ICONS = [
  <svg key="a" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" />
  </svg>,
  <svg key="b" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9.5 2a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 8.5a3 3 0 0 0 1 2.2A3 3 0 0 0 4 13a3 3 0 0 0 2.5 3v.5a3 3 0 0 0 3 3 2.5 2.5 0 0 0 2.5-2.5V4.5A2.5 2.5 0 0 0 9.5 2z" />
    <path d="M14.5 2a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 8.5a3 3 0 0 1-1 2.2A3 3 0 0 1 20 13a3 3 0 0 1-2.5 3v.5a3 3 0 0 1-3 3A2.5 2.5 0 0 1 12 17V4.5A2.5 2.5 0 0 1 14.5 2z" />
  </svg>,
  <svg key="c" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>,
  <svg key="d" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>,
  <svg key="e" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>,
  <svg key="f" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>,
];

const Arrow = () => (
  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const reduce = useReducedMotion();
  const cover = COVERS[index % COVERS.length];
  const icon = ICONS[index % ICONS.length];

  const body = (
    <>
      {/* ---- cover panel ---- */}
      <div className={`relative h-52 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${cover.panel}`}>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.24), transparent 28%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18), transparent 24%)",
          }}
        />
        <div aria-hidden className="absolute left-8 top-8 h-28 w-28 rotate-[-8deg] rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl" />
        <div aria-hidden className="absolute bottom-8 right-8 h-28 w-28 rounded-full border border-white/20 bg-black/10 shadow-2xl backdrop-blur-xl" />
        <div aria-hidden className="absolute inset-x-10 top-10 h-20 rounded-full border border-white/20" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
          <div className={`mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-2xl ring-1 ring-white/30 ${cover.badge}`}>
            {icon}
          </div>
          {project.features.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {project.features.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/20 bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow-lg dark:bg-black/45 dark:text-white"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- body ---- */}
      <div className="flex flex-1 flex-col p-2 pt-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {project.kind === "case-study" ? "Case Study" : "Platform"}
          </span>
          {project.live_url && (
            <span className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Live
            </span>
          )}
          {project.featured && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
              Featured
            </span>
          )}
        </div>

        <h3 className="mb-3 text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-primary">
          {project.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

        {project.highlight && (
          <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/10 p-3 text-sm font-semibold text-primary">
            {project.highlight}
          </div>
        )}

        {project.stack.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-sm font-semibold">
            {project.live_url ? "Visit the live system" : "View system details"}
          </span>
          <Arrow />
        </div>
      </div>
    </>
  );

  const shell =
    "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-4 text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: (index % 3) * 0.08 }}
      className="h-full"
    >
      {project.live_url ? (
        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={shell}>
          {body}
        </a>
      ) : (
        <article className={shell}>{body}</article>
      )}
    </motion.div>
  );
}
