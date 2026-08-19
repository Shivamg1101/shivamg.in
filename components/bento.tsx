"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { GlowingEffect } from "@/components/glowing-effect";

type Cell = {
  area: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  href?: string;
  stack?: string[];
};

const Shield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const Globe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z" />
  </svg>
);
const Layers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m12 2 9 5-9 5-9-5 9-5z" />
    <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
  </svg>
);
const Brain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9.5 2a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 8.5a3 3 0 0 0 1 2.2A3 3 0 0 0 4 13a3 3 0 0 0 2.5 3v.5a3 3 0 0 0 3 3 2.5 2.5 0 0 0 2.5-2.5V4.5A2.5 2.5 0 0 0 9.5 2z" />
    <path d="M14.5 2a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 8.5a3 3 0 0 1-1 2.2A3 3 0 0 1 20 13a3 3 0 0 1-2.5 3v.5a3 3 0 0 1-3 3A2.5 2.5 0 0 1 12 17V4.5A2.5 2.5 0 0 1 14.5 2z" />
  </svg>
);
const Send = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m22 2-7 20-4-9-9-4 20-7z" />
  </svg>
);

const CELLS: Cell[] = [
  {
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
    icon: <Shield />,
    title: "Production-First",
    body: "Read-only dry runs and diagnostic probes before anything touches live data. Write operations stay disabled until the inputs are verified.",
    href: "/experience",
  },
  {
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
    icon: <Globe />,
    title: "Operations at Scale",
    body: "1,200+ domains, 13 branches and ten workflows running unattended against real student records.",
    href: "/experience",
  },
  {
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
    icon: <Layers />,
    title: "Modern Tech Stack",
    body: "Technologies and tools I use to build production systems",
    href: "/about",
    stack: ["n8n", "OpenAI", "Qdrant", "Next.js", "NestJS", "Supabase", "PostgreSQL", "Docker"],
  },
  {
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
    icon: <Brain />,
    title: "Retrieval-Grounded AI",
    body: "Agents that answer from source material and escalate to a human rather than guessing.",
    href: "/case-studies",
  },
  {
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
    icon: <Send />,
    title: "Ready to Collaborate",
    body: "Let's build something that runs itself",
    href: "/#contact",
  },
];

function Card({ cell, index }: { cell: Cell; index: number }) {
  const reduce = useReducedMotion();

  const inner = (
    <div className="relative flex h-full flex-1 flex-col justify-between gap-3">
      <div className="w-fit rounded-lg border border-gray-400 p-2 text-primary dark:border-gray-600">
        {cell.icon}
      </div>
      <div className="space-y-3">
        <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold tracking-tight text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
          {cell.title}
        </h3>
        <p className="text-sm/[1.125rem] text-neutral-700 md:text-base/[1.375rem] dark:text-neutral-400">
          {cell.body}
        </p>

        {cell.stack && (
          <div className="mt-8 grid grid-cols-4 gap-2">
            {cell.stack.map((s) => (
              <div
                key={s}
                className="flex flex-col items-center gap-1 rounded-lg border border-gray-200/70 bg-white/60 p-2 backdrop-blur-sm dark:border-gray-800/30 dark:bg-black/40"
              >
                <span className="text-center text-[10px] font-medium leading-tight text-black dark:text-white">
                  {s}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.li
      className={`min-h-[14rem] list-none ${cell.area}`}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.08 }}
    >
      <div className="relative h-full rounded-2xl border border-border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect spread={40} proximity={64} borderWidth={2} disabled={Boolean(reduce)} />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-gray-300/80 bg-white/90 p-6 backdrop-blur-sm dark:border-gray-800/50 dark:bg-black/80 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          {cell.href ? (
            <Link
              href={cell.href}
              className="group block h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {inner}
            </Link>
          ) : (
            inner
          )}
        </div>
      </div>
    </motion.li>
  );
}

export function Bento() {
  return (
    <section id="highlights" className="relative overflow-hidden bg-background py-16 dark:bg-black">
      <div aria-hidden className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 opacity-50 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/5 opacity-50 blur-3xl" />

      <div className="container mx-auto px-4 md:px-6">
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          {CELLS.map((c, i) => (
            <Card key={c.title} cell={c} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
