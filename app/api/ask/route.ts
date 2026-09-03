import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildContext, systemPrompt } from "@/lib/chat-context";
import { hashClientIp } from "@/lib/client-ip";
import { getProfile } from "@/lib/queries";

/**
 * Chat endpoint for the site agent.
 *
 * Budget, which drives every number below: OpenRouter's free tier allows 50
 * requests a day and 20 a minute on an account with no purchased credit. Those
 * are the ceiling for the whole site, not per visitor, so the caps here sit
 * deliberately under them. Hitting our own limit produces a friendly message;
 * hitting OpenRouter's produces an error in front of a recruiter.
 */

const LIMITS = {
  perDayGlobal: 40, // under OpenRouter's 50 — headroom for retries and my own testing
  // Deliberately tight while the global budget is 40. On a day when a post
  // sends a crowd at once, breadth beats depth: at 8 apiece five people can
  // drain the day before the sixth arrives, whereas at 3 the same budget
  // serves thirteen. Most visitors ask one or two questions and leave; the
  // handful who want more can read the pages the agent points them at. Raise
  // this back to 8 once the global cap is no longer the binding constraint.
  perDayPerIp: 3,
  perMinuteGlobal: 10, // under the 20/min ceiling
  message: 1000, // characters
  historyTurns: 6, // how much conversation to send back
};

// Free model availability changes without notice — deepseek's free tier was
// withdrawn between building this and testing it. A single hardcoded slug means
// the feature 404s silently one morning, so try a second before giving up.
const MODELS = ["minimax/minimax-m3:free", "google/gemma-4-31b-it:free"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shivamg.in";

const OUT_OF_BUDGET =
  "I've answered as many questions as I can today — I run on a small free allowance. " +
  "Do come back tomorrow. In the meantime everything I'd have told you is on this site, " +
  "and you can reach Shivam directly at /contact.";

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  if (!SERVICE_KEY || !OPENROUTER_KEY) {
    return NextResponse.json({ error: "Chat is not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const message = typeof b.message === "string" ? b.message.trim().slice(0, LIMITS.message) : "";
  if (!message) return NextResponse.json({ error: "Ask me something." }, { status: 400 });

  const history: Turn[] = Array.isArray(b.history)
    ? (b.history as Turn[])
        .filter((t) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
        .slice(-LIMITS.historyTurns)
        .map((t) => ({ role: t.role, content: t.content.slice(0, LIMITS.message) }))
    : [];

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { hash: ipHash } = hashClientIp(request);
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const minuteAgo = new Date(Date.now() - 60_000).toISOString();

  // Three counts, one round trip each. Cheap enough at this volume, and far
  // simpler to reason about than a single clever query.
  const [globalDay, ipDay, globalMinute] = await Promise.all([
    supabase.from("chat_usage").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
    supabase
      .from("chat_usage")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", dayAgo),
    supabase.from("chat_usage").select("id", { count: "exact", head: true }).gte("created_at", minuteAgo),
  ]);

  const overLimit =
    (globalDay.count ?? 0) >= LIMITS.perDayGlobal ||
    (ipDay.count ?? 0) >= LIMITS.perDayPerIp ||
    (globalMinute.count ?? 0) >= LIMITS.perMinuteGlobal;

  if (overLimit) {
    // 200, not 429: the widget should render this as a normal reply rather than
    // an error state. Running out of budget is expected, not a fault.
    return NextResponse.json({ answer: OUT_OF_BUDGET, limited: true });
  }

  const [context, profile] = await Promise.all([buildContext(), getProfile()]);
  const system = systemPrompt(context, profile?.name ?? "Shivam Gupta");

  let answer: string | null = null;
  let lastError = "";

  for (const model of MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
          // OpenRouter uses these for attribution on its dashboard.
          "HTTP-Referer": SITE,
          "X-Title": "shivamg.in",
        },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          temperature: 0.3,
          messages: [{ role: "system", content: system }, ...history, { role: "user", content: message }],
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        lastError = `${model}: HTTP ${res.status}`;
        continue; // model retired, rate limited, or briefly down — try the next
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) {
        answer = text.trim();
        break;
      }
      lastError = `${model}: empty response`;
    } catch (e) {
      lastError = `${model}: ${e instanceof Error ? e.message : "failed"}`;
    }
  }

  if (!answer) {
    console.error("[ask] all models failed:", lastError);
    return NextResponse.json({
      answer:
        "Something went wrong on my end just then. Everything I'd have told you is on this site, " +
        "and you can reach Shivam directly at /contact.",
      limited: false,
    });
  }

  // Only successful answers count against the budget — a failed call to us
  // shouldn't cost the visitor one of their eight.
  await supabase.from("chat_usage").insert({ ip_hash: ipHash });

  // Opportunistic prune. Nothing older than two days is ever read.
  if (Math.random() < 0.05) {
    await supabase
      .from("chat_usage")
      .delete()
      .lt("created_at", new Date(Date.now() - 2 * 86_400_000).toISOString());
  }

  return NextResponse.json({ answer, limited: false });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
