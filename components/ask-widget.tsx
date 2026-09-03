"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Turn = { role: "user" | "assistant"; content: string };

/**
 * Turns the paths, URLs and addresses the model mentions into real links.
 *
 * Site paths are matched against a fixed list of routes rather than "anything
 * starting with a slash", because answers are full of things like "800/80
 * chunking" that are not links. Only https and mailto are ever emitted, and
 * everything is rendered as React elements, so model output can never become
 * markup.
 */
const ROUTES = "contact|about|projects|experience|case-studies|blog";
const LINKABLE_SOURCE =
  `(https?://[^\\s<>()]+[^\\s<>().,;:!?])` +
  `|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})` +
  `|(/(?:${ROUTES})(?:/[A-Za-z0-9\\-_]+)*)`;

function RichText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let n = 0;

  const cls = "underline underline-offset-2 hover:opacity-80";

  // matchAll over a fresh regex: no shared lastIndex to reset, so two messages
  // rendering in the same tick cannot interfere with each other.
  for (const m of text.matchAll(new RegExp(LINKABLE_SOURCE, "g"))) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    const [tok, url, email, path] = m;
    const key = `l${n++}`;

    if (url && /^https:\/\//i.test(url)) {
      out.push(
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={cls}>
          {url.replace(/^https:\/\//, "")}
        </a>
      );
    } else if (email) {
      out.push(<a key={key} href={`mailto:${email}`} className={cls}>{email}</a>);
    } else if (path) {
      out.push(
        <Link key={key} href={path} onClick={onNavigate} className={cls}>
          {path}
        </Link>
      );
    } else {
      out.push(tok); // http:// and anything else stays inert text
    }
    last = m.index! + tok.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

const SUGGESTIONS = [
  "What does he actually automate?",
  "Walk me through the RAG agent",
  "Is he available for work?",
];

/**
 * A node-graph mark rather than a speech bubble. Every site uses the bubble;
 * this one belongs to a person who builds workflows, and the icon should say so.
 */
function NodeMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M7 7h3.5M7 7v10M7 17h3.5M13.5 12H17M10.5 7a1.5 1.5 0 0 0 1.5 1.5h.2a1.6 1.6 0 0 1 1.5 1.2l.3 1.3M10.5 17a1.5 1.5 0 0 1 1.5-1.5h.2a1.6 1.6 0 0 0 1.5-1.2l.3-1.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="7" r="1.9" fill="currentColor" />
      <circle cx="5.5" cy="17" r="1.9" fill="currentColor" />
      <circle cx="18.5" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const reduce = useReducedMotion();

  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  // Escape closes, which people expect from anything that overlays the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    setInput("");
    setBusy(true);
    const next = [...turns, { role: "user" as const, content: question }];
    setTurns(next);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: turns }),
      });
      const data = await res.json();
      setTurns([
        ...next,
        {
          role: "assistant",
          content:
            data.answer ??
            "Something went wrong just then. You can reach Shivam directly through the contact page.",
        },
      ]);
    } catch {
      setTurns([
        ...next,
        {
          role: "assistant",
          content: "I couldn't reach the server. You can reach Shivam directly through the contact page.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close the assistant" : "Ask about Shivam"}
        aria-expanded={open}
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-colors hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:bottom-6 md:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.span
              key="mark"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <NodeMark className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask about Shivam"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(32rem,calc(100dvh-8rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:w-[24rem] md:bottom-26 md:right-6"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-primary/10 text-primary">
                <NodeMark className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-tight">Ask about Shivam</p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  Answers from this site. Not him.
                </p>
              </div>
            </div>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {turns.length === 0 && (
                <div className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    I can answer questions about his work, the systems he&apos;s built and what he&apos;s
                    working with. Everything I say comes from this site.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-left text-[12px] transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((t, i) => (
                <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      t.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[13px] leading-relaxed text-primary-foreground"
                        : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-background/60 px-3.5 py-2 text-[13px] leading-relaxed [&_a]:text-primary"
                    }
                  >
                    {t.role === "assistant" ? (
                      <RichText text={t.content} onNavigate={() => setOpen(false)} />
                    ) : (
                      t.content
                    )}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-background/60 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border px-3 py-3"
            >
              <input
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about his work"
                maxLength={1000}
                disabled={busy}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
