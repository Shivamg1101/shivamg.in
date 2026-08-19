"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

    const { error } = await createClient().from("messages").insert({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    });

    if (error) {
      setState("error");
      setError("That didn't send. Try again, or email me directly.");
      return;
    }

    form.reset();
    setState("sent");
  }

  const field =
    "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-lg gap-4 text-left">
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
