"use client";

import { useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"), // honeypot
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setState("error");
        setError(json.error ?? "That didn't send. Try again, or email me directly.");
        return;
      }

      form.reset();
      setState("sent");
    } catch {
      setState("error");
      setError("That didn't send. Check your connection, or email me directly.");
    }
  }

  const field =
    "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 text-left">
      {/* Honeypot: off-screen and hidden from assistive tech. Bots fill it. */}
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] opacity-0">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="cf-name" className="text-sm font-semibold">
          Name
        </label>
        <input id="cf-name" name="name" required maxLength={120} className={field} placeholder="Your name" />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="cf-email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          maxLength={200}
          className={field}
          placeholder="you@company.com"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="cf-message" className="text-sm font-semibold">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          className={`${field} resize-y`}
          placeholder="What would you like to talk about?"
        />
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>

      <p aria-live="polite" className="min-h-5 text-sm">
        {state === "sent" && <span className="text-success">Sent — I&rsquo;ll get back to you.</span>}
        {state === "error" && <span className="text-destructive">{error}</span>}
      </p>
    </form>
  );
}
