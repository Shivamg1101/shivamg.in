"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary";

/**
 * `next` arrives in the query string, so it is attacker-supplied. Handing it
 * straight to the router turns the login page into an open redirect: a link to
 * /admin/login?next=https://evil.example lands the admin on someone else's
 * site immediately after they authenticate, which is a convincing place to ask
 * them to "log in again".
 *
 * The proxy only ever sets this to a path under /admin, so accepting exactly
 * that costs nothing. Note the second test: "//evil.example" is a protocol-
 * relative URL that still begins with a slash, so checking for a leading slash
 * alone would let it through.
 */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return /^\/admin(\/|$)/.test(raw) ? raw : "/admin";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);

    const { error } = await createClient().auth.signInWithPassword({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });

    setBusy(false);
    if (error) {
      setErr("Those details did not work. Check the email and password and try again.");
      return;
    }
    router.push(safeNext(params.get("next")));
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid w-full max-w-sm gap-4 rounded-md border border-border bg-card p-7"
    >
      <div>
        <h1 className="text-xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to edit the site.</p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" className={input} />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={input}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p aria-live="polite" className="min-h-5 text-sm text-destructive">
        {err}
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-md border border-border bg-card p-7 text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
