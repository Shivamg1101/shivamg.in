"use client";

import { useMemo, useRef } from "react";
import { StaggerItem, TimelineCard, TimelineFill, TimelineRow } from "@/components/motion";
import { formatRange, type Experience } from "@/lib/types";

const NODE_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-yellow-500 to-orange-500",
  "from-green-500 to-emerald-500",
];

const NODE_ICONS = [
  // cpu
  <svg key="cpu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>,
  // server
  <svg key="server" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <path d="M6 6h.01M6 18h.01" />
  </svg>,
  // code
  <svg key="code" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>,
  // cloud
  <svg key="cloud" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>,
];

/** "2026 – Now" / "2025 – 2026" / "2024" */
function yearLabel(start: string, end: string | null, isCurrent: boolean) {
  const a = new Date(start).getFullYear();
  if (isCurrent || !end) return `${a} – Now`;
  const b = new Date(end).getFullYear();
  return a === b ? String(a) : `${a} – ${b}`;
}

function MapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Calendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function Trophy() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

export function Timeline({ items }: { items: Experience[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // Deterministic particle positions — random() would differ between
  // server and client render and trip hydration.
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: `${(i * 37 + 11) % 84 + 8}%`,
        top: `${(i * 53 + 7) % 88 + 5}%`,
        delay: `${((i * 17) % 90) / 10}s`,
      })),
    []
  );

  return (
    <div ref={ref} className="relative py-2">
      {/* centre line + scroll-driven fill */}
      <div className="absolute inset-y-0 left-1/2 z-0 hidden w-[3px] -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent lg:block">
        <TimelineFill targetRef={ref} />
      </div>

      {/* drifting particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
        {particles.map((p, i) => (
          <span
            key={i}
            className="animate-drift absolute h-2 w-2 rounded-full bg-primary/20"
            style={{ left: p.left, top: p.top, animationDelay: p.delay }}
          />
        ))}
      </div>

      {items.map((x, i) => {
        const right = i % 2 === 1;
        return (
          <TimelineRow
            key={x.id}
            className={`relative z-10 mb-18 flex flex-col items-center gap-6 last:mb-0 lg:mb-24 lg:gap-8 ${
              right ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            <TimelineCard fromRight={right} className="w-full min-w-0 flex-1">
              <article
                className={`card-hover group relative overflow-hidden rounded-2xl border bg-card/60 p-7 shadow-xl backdrop-blur-sm ${
                  x.is_current ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
                }`}
              >
                <span className="absolute right-4 top-4 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    {x.is_current && (
                      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-300">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Current Role
                      </span>
                    )}
                    <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-primary">
                      {x.title}
                    </h3>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 text-lg font-semibold text-primary">
                        <MapPin />
                        {x.company}
                      </span>
                      {x.location && (
                        <span className="rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {x.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/30">
                    <Calendar />
                    {formatRange(x.start_date, x.end_date, x.is_current)}
                  </div>
                </div>

                {x.metrics.length > 0 && (
                  <div className="mb-5 grid gap-2 sm:grid-cols-2">
                    {x.metrics.map((m) => (
                      <div
                        key={m}
                        className="rounded-xl border border-primary/15 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                )}

                {x.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {x.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {x.summary && (
                  <p className="mb-6 leading-relaxed text-muted-foreground">{x.summary}</p>
                )}

                {x.achievements.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <Trophy />
                      <h4 className="text-[17px] font-semibold">Key Achievements</h4>
                    </div>
                    <div className="grid gap-3">
                      {x.achievements.map((a, ai) => (
                        <StaggerItem key={a} index={ai}>
                          <div className="group/a flex items-start gap-4 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-colors duration-300 hover:border-primary/30">
                            <span className="mt-2.5 h-2 w-2 flex-none rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-transform duration-300 group-hover/a:scale-125" />
                            <span className="text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover/a:text-foreground">
                              {a}
                            </span>
                          </div>
                        </StaggerItem>
                      ))}
                    </div>
                  </>
                )}
              </article>
            </TimelineCard>

            {/* node on the centre line: icon badge with a year pill beneath */}
            <div className="relative z-20 hidden flex-none flex-col items-center lg:flex">
              <div
                className={`h-16 w-16 rounded-full bg-gradient-to-br p-1 shadow-xl ring-2 ring-primary/30 ${
                  NODE_GRADIENTS[i % NODE_GRADIENTS.length]
                }`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-primary/20 bg-background text-foreground">
                  {NODE_ICONS[i % NODE_ICONS.length]}
                </div>
              </div>
              <span className="relative z-20 mt-[3px] translate-x-[45px] whitespace-nowrap rounded-full border-2 border-primary/50 bg-background px-3 py-[3px] text-xs font-semibold tabular-nums text-primary">
                {yearLabel(x.start_date, x.end_date, x.is_current)}
              </span>
            </div>

            <div className="hidden flex-1 lg:block" />
          </TimelineRow>
        );
      })}
    </div>
  );
}
