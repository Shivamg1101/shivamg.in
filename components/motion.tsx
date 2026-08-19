"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE_OUT = [0, 0, 0.2, 1] as const;

/** Fade + rise on entering the viewport. Mirrors the reference's whileInView. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ delay, duration: 0.6, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Timeline rows: rise + scale, then the card slides in from its own side. */
export function TimelineReveal({
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
      initial={{ opacity: 0, y: 70, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.9 }}
    >
      <motion.div
        initial={{ opacity: 0, x: fromRight ? 44 : -44 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Staggered achievement rows inside an experience card. */
export function StaggerItem({ children, index }: { children: ReactNode; index: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.18 + index * 0.09 }}
    >
      {children}
    </motion.div>
  );
}

/** Thin progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="fixed left-0 top-0 z-[100] h-0.5 w-full origin-left bg-primary"
    />
  );
}

/** Vertical gradient that fills the experience timeline as you scroll past it. */
export function TimelineFill({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 0.85", "end 0.35"],
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
