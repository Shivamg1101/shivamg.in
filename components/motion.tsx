"use client";

import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** The reference's FadeIn easing and duration, used everywhere. */
const EASE = [0.25, 0.1, 0.25, 1] as const;
const DURATION = 0.7;
const VIEWPORT = { once: true, margin: "50px" } as const;

/** Fade + rise on entering the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  x = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEWPORT}
      transition={{ delay, duration: DURATION, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A timeline row, driven continuously by scroll rather than fired once:
 * it rises in from translateY(100px) scale(0.8), holds while centred, then
 * shrinks and fades back out as it leaves upward — matching the reference.
 * The caller's flex classes go on the animated element so the row's children
 * stay direct flex children.
 */
export function TimelineRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const y = useTransform(p, [0, 0.35, 0.62, 1], [100, 0, 0, -100]);
  const scale = useTransform(p, [0, 0.35, 0.62, 1], [0.8, 1, 1, 0.8]);
  const opacity = useTransform(p, [0, 0.28, 0.72, 1], [0, 1, 1, 0]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ y, scale, opacity }}>
      {children}
    </motion.div>
  );
}

/** The card inside a timeline row: slides in from its own side. */
export function TimelineCard({
  children,
  fromRight = false,
  className,
}: {
  children: ReactNode;
  fromRight?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: fromRight ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION, ease: EASE, delay: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

/** Achievement rows: slide in from the left, staggered. */
export function StaggerItem({ children, index }: { children: ReactNode; index: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: 0.3 + index * 0.1 }}
    >
      {children}
    </motion.div>
  );
}

/** Thin progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[100] h-0.5 w-full origin-left bg-primary"
    />
  );
}

/** Vertical gradient that fills the timeline as it scrolls past. */
export function TimelineFill({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.9", "end 0.4"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleY: reduce ? 1 : scaleY }}
      className="h-full w-full origin-top bg-gradient-to-b from-primary via-blue-500 to-purple-500"
    />
  );
}
