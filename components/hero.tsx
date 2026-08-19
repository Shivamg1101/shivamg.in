"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Profile } from "@/lib/types";

/** The same introduction, cycled through a few languages. */
const GREETINGS = [
  "Hi, I'm Shivam",
  "नमस्ते, मैं शिवम हूँ",
  "Hola, soy Shivam",
  "Bonjour, je suis Shivam",
  "こんにちは、シヴァムです",
];

/* ------------------------------------------------------------------ *
 * Typewriter: types a greeting, holds, deletes, moves to the next.
 * ------------------------------------------------------------------ */
function useTypewriter(words: string[], enabled: boolean) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(words[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const word = words[index % words.length];

    if (!deleting && text === word) {
      const hold = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(hold);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const next = deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1);
    const t = setTimeout(() => setText(next), deleting ? 55 : 110);
    return () => clearTimeout(t);
  }, [text, deleting, index, words, enabled]);

  return text;
}

/* ------------------------------------------------------------------ *
 * Drifting particle field. Generated after mount so the random values
 * never differ between server and client render.
 * ------------------------------------------------------------------ */
function Particles({ count = 50 }: { count?: number }) {
  const [seeds, setSeeds] = useState<
    { size: number; x: number; y: number; dur: number; delay: number }[]
  >([]);

  useEffect(() => {
    setSeeds(
      Array.from({ length: count }, () => ({
        size: 1 + Math.random() * 3,
        x: Math.random() * 100,
        y: Math.random() * 100,
        dur: 12 + Math.random() * 14,
        delay: Math.random() * 10,
      }))
    );
  }, [count]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-primary/30"
          style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.9, 0], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Wireframe geometry drifting behind the copy.
 * ------------------------------------------------------------------ */
function Geometry({ still }: { still: boolean }) {
  const spin = (s: number) =>
    still ? {} : { animate: { rotate: 360 }, transition: { duration: s, repeat: Infinity, ease: "linear" as const } };

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* nested diamond, centre */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={still ? {} : { rotateX: [0, 25, 0], rotateY: [0, 360], rotateZ: [0, 12, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
      >
        <div className="relative h-80 w-80 rotate-45 border-2 border-primary/30">
          <div className="absolute inset-4 -rotate-45 rounded-lg border-2 border-blue-500/25" />
          <div className="absolute inset-8 rotate-45 rounded-lg border-2 border-purple-500/25" />
          <div className="absolute inset-12 -rotate-45 rounded-lg border-2 border-cyan-500/25" />
          <div className="absolute inset-16 rotate-45 rounded-full border border-emerald-500/20" />
        </div>
      </motion.div>

      {/* concentric rings, top right */}
      <motion.div
        className="absolute right-20 top-20 h-32 w-32 rounded-full border-2 border-primary/40"
        animate={still ? {} : { scale: [1, 1.15, 1], rotate: [0, -360] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-2 rounded-full border-2 border-blue-500/35">
          <div className="absolute inset-2 rounded-full border border-purple-500/30">
            <div className="absolute inset-2 rounded-full border border-cyan-500/25" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60" />
      </motion.div>

      {/* rotated square, bottom left */}
      <motion.div
        className="absolute bottom-20 left-20 h-28 w-28 rotate-45 border-2 border-cyan-500/40"
        animate={still ? {} : { x: [0, 18, 0], y: [0, -28, 0], rotate: [45, 405] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-2 -rotate-45 rounded-lg border-2 border-primary/35" />
        <div className="absolute inset-4 rotate-45 rounded-lg border border-blue-500/30" />
      </motion.div>

      {/* small square, top left */}
      <motion.div
        className="absolute left-32 top-32 h-16 w-16 rotate-12 rounded-lg border border-emerald-500/30"
        animate={still ? {} : { y: [0, -18, 0], rotateY: [0, 360] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-1 -rotate-12 rounded-lg border border-primary/25" />
      </motion.div>

      {/* rings, bottom right */}
      <motion.div
        className="absolute bottom-32 right-32 h-20 w-20 rounded-full border border-purple-500/30"
        animate={still ? {} : { scale: [1, 1.08, 1], rotate: [0, -360] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-2 rounded-full border border-cyan-500/25">
          <div className="absolute inset-2 rounded-full border border-primary/20" />
        </div>
      </motion.div>

      {/* triangle */}
      <motion.div className="absolute right-1/4 top-1/4 h-24 w-24" {...spin(40)}>
        <div
          className="absolute inset-0 border-b-2 border-l-2 border-r-2 border-primary/25"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Icons
 * ------------------------------------------------------------------ */
const Doc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const Eye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const Down = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const Rocket = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" aria-hidden>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
  </svg>
);
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.4.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17 4.7 18 5 18 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.4 8.4h4.2V24H.4zM8.4 8.4h4v2.1h.1c.6-1.1 2-2.3 4.1-2.3 4.4 0 5.2 2.9 5.2 6.6V24h-4.2v-6.8c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6V24H8.4z" />
  </svg>
);

/* ------------------------------------------------------------------ */

export function Hero({ profile }: { profile: Profile }) {
  const reduce = useReducedMotion();
  const still = Boolean(reduce);
  const greeting = useTypewriter(GREETINGS, !still);
  const rise = useMemo(
    () => ({
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
    }),
    []
  );

  return (
    <section id="hero" aria-label="Hero" className="w-full overflow-hidden">
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background dark:bg-black">
        {!still && <Particles />}

        {/* ambient glows */}
        <div aria-hidden className="absolute right-20 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 blur-3xl" />
        <div aria-hidden className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/10 to-primary/10 blur-3xl" />

        <Geometry still={still} />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          {/* typewriter greeting */}
          <motion.div
            {...rise}
            className="mb-6 flex min-h-[1.2em] w-full items-center justify-center text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            {/* plain inline, not inline-flex, so long greetings wrap on narrow
                screens instead of running past the viewport */}
            <div className="text-balance bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text leading-tight text-transparent">
              <span>{greeting}</span>
              <span className="ml-1 inline-block h-[0.8em] w-0.5 translate-y-[0.06em] animate-pulse bg-primary align-middle" />
            </div>
          </motion.div>

          {/* headline */}
          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.1 }}
            className="mb-4 flex items-center justify-center px-4 text-lg sm:text-xl md:text-2xl lg:text-3xl"
          >
            <span className="font-bold text-primary dark:text-[#E0D7FF] dark:drop-shadow-[0_1px_8px_rgba(167,139,250,0.25)]">
              {profile.headline}
            </span>
          </motion.div>

          {/* tagline */}
          {profile.tagline && (
            <motion.p
              {...rise}
              transition={{ ...rise.transition, delay: 0.2 }}
              className="mx-auto mb-8 max-w-4xl px-4 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg lg:text-xl"
            >
              {profile.tagline}
            </motion.p>
          )}

          {/* actions */}
          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.3 }}
            className="mx-auto flex w-full max-w-lg flex-col items-center justify-center gap-4 px-4 sm:flex-row"
          >
            {/* Résumé — splits into View / Download on hover */}
            <div className="group relative z-10 w-full min-w-[220px] sm:w-auto">
              <div className="transition-opacity duration-200 group-hover:pointer-events-none group-hover:opacity-0">
                <div className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg">
                  <Doc />
                  <span className="text-base">Résumé</span>
                </div>
              </div>
              <div className="absolute inset-0 flex gap-1 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                <a
                  href={profile.resume_url ?? "#"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-l-xl bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  <Eye />
                  View
                </a>
                <a
                  href={profile.resume_url ?? "#"}
                  download
                  className="flex flex-1 items-center justify-center gap-2 rounded-r-xl bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Down />
                  Download
                </a>
              </div>
            </div>

            <Link
              href="/contact"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-primary bg-card/80 px-6 py-3 font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-primary/5 hover:text-primary sm:w-auto"
            >
              <Rocket />
              <span>Let&rsquo;s Build Together</span>
            </Link>
          </motion.div>

          {/* socials */}
          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.4 }}
            className="mt-6 flex items-center gap-3"
          >
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
              >
                <GitHubIcon />
                GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
            )}
          </motion.div>

          {/* scroll cue */}
          <motion.div
            {...rise}
            transition={{ ...rise.transition, delay: 0.5 }}
            className="mt-8 flex flex-col items-center text-muted-foreground"
          >
            <motion.div
              className="flex flex-col items-center"
              animate={still ? {} : { y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="mb-2 text-sm">Scroll to explore</span>
              <div className="flex h-10 w-6 justify-center overflow-visible rounded-full border-2 border-primary/30">
                <motion.div
                  className="mt-2 h-3 w-1 rounded-full bg-primary"
                  animate={still ? {} : { y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
