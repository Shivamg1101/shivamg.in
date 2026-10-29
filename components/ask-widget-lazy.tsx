"use client";

import dynamic from "next/dynamic";

/**
 * The chat launcher is a fixed-position button that does nothing without
 * JavaScript, so there is no value in server-rendering and hydrating it with
 * the first paint. Loading it as its own chunk after hydration keeps its code
 * (and its AnimatePresence tree) off the critical path, which is main-thread
 * time on mobile. Being fixed-position, its late arrival shifts no layout.
 */
export const AskWidgetLazy = dynamic(
  () => import("@/components/ask-widget").then((m) => m.AskWidget),
  { ssr: false }
);
