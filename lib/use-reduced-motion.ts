"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Hydration-safe replacement for framer-motion's `useReducedMotion`.
 *
 * framer's hook reads `matchMedia` during the very first client render, while
 * the server has no preference and renders as if motion is allowed. Every
 * component that branches on it (`if (reduce) return <div>…`) therefore
 * rendered different markup on the client for anyone with reduced motion
 * enabled, and React threw a hydration error (#418) and re-rendered the page.
 *
 * `useSyncExternalStore` uses the server snapshot (`false`) while hydrating and
 * switches to the real preference straight after, so the first client render
 * always matches the HTML and reduced-motion users still get the still version
 * a moment later. Returns a boolean rather than framer's `boolean | null`.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
