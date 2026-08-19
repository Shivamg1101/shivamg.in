"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/* ---------------- Vision / Expertise / Approach tabs ---------------- */

export type Tab = { key: string; heading: string; body: string; tags: string[] };

export function ProfileTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const t = tabs[active];

  return (
    <div>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              i === active ? "text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {i === active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-blue-600"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.key}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={t.key}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="mt-4 rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm"
      >
        <h3 className="text-base font-bold">{t.heading}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {t.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Technical stack with proficiency bars ---------------- */

export type Skill = { name: string; level: number; note: string; projects: number };
export type SkillGroup = { key: string; skills: Skill[] };

export function SkillMatrix({ groups }: { groups: SkillGroup[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const g = groups[active];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {groups.map((grp, i) => (
          <button
            key={grp.key}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
              i === active
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {grp.key}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {g.skills.map((s, i) => (
          <motion.div
            key={`${g.key}-${s.name}`}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: i * 0.05 }}
            className="card-hover rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{s.name}</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {s.projects} {s.projects === 1 ? "project" : "projects"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Proficiency</span>
              <span className="font-semibold tabular-nums text-primary">{s.level}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500"
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${s.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.05 }}
              />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
