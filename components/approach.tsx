"use client";

import { motion, useReducedMotion } from "framer-motion";

const PHASES = [
  {
    n: "Phase 1",
    title: "Map the manual work",
    body: "I sit with whoever does the task today and trace it end to end — the spreadsheet, the copy-paste, the thing they only remember on Fridays. Most of the value is in finding the steps nobody documented.",
  },
  {
    n: "Phase 2",
    title: "Build behind a dry run",
    body: "The first version writes nothing. Read-only probes confirm the data is shaped the way I think it is, and send nodes stay disabled until every input is verified against production.",
  },
  {
    n: "Phase 3",
    title: "Ship it and let it run",
    body: "It goes live on a schedule or a webhook, reports what it did, and escalates only the exceptions. If it needs babysitting, it is not finished.",
  },
];

function PhaseCard({ p, i }: { p: (typeof PHASES)[number]; i: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="group/card relative mx-auto flex w-full max-w-sm items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-card to-card/60 p-4 shadow-lg transition-all duration-500 hover:border-primary/30 hover:shadow-2xl lg:h-[35rem] dark:from-card dark:to-card/80"
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.12 }}
    >
      {/* wash that fades in behind the card on hover */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/90 to-blue-600/90 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
      />

      <div className="relative z-20 px-8 py-10 lg:px-10">
        {/* the phase pill: spinning conic border, hidden on hover */}
        <div className="absolute left-1/2 top-1/2 mx-auto flex min-w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center transition duration-200 group-hover/card:-translate-y-4 group-hover/card:opacity-0">
          <div className="relative inline-flex overflow-hidden rounded-full p-[1.5px]">
            {!reduce && (
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--primary))_0%,#3b82f6_50%,hsl(var(--primary))_100%)]" />
            )}
            <span className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full border border-border/50 bg-card/90 px-5 py-2 text-2xl font-bold text-black shadow-lg backdrop-blur-sm transition-all duration-300 dark:text-white">
              {p.n}
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </span>
          </div>
        </div>

        {/* revealed on hover */}
        <h3 className="relative z-10 mt-4 text-center text-3xl font-bold text-foreground opacity-0 transition duration-200 group-hover/card:-translate-y-2 group-hover/card:text-white group-hover/card:opacity-100">
          {p.title}
        </h3>
        <p className="relative z-10 mt-4 text-center text-sm text-muted-foreground opacity-0 transition duration-200 group-hover/card:-translate-y-2 group-hover/card:text-white/90 group-hover/card:opacity-100">
          {p.body}
        </p>
      </div>
    </motion.div>
  );
}

export function Approach() {
  return (
    <section aria-label="Approach" className="relative w-full bg-background py-20 dark:bg-black">
      <div aria-hidden className="absolute left-20 top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/5 to-blue-500/5 blur-3xl" />
      <div aria-hidden className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl" />

      <div className="container mx-auto px-4 md:px-6">
        <h2 className="relative text-center text-4xl font-bold text-foreground sm:text-5xl">
          My{" "}
          <span className="relative inline-block bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Approach
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Hover a phase to see what actually happens in it.
        </p>

        <div className="my-16 flex w-full flex-col items-center justify-center gap-4 lg:my-20 lg:flex-row">
          {PHASES.map((p, i) => (
            <PhaseCard key={p.n} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
