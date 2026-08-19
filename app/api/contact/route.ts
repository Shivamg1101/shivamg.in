import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

/** Matches the CHECK constraints on public.messages. */
const LIMITS = { name: 120, email: 200, message: 4000 };

function clean(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = clean(b.name, LIMITS.name);
  const email = clean(b.email, LIMITS.email);
  const message = clean(b.message, LIMITS.message);
  // Bots fill hidden fields; humans leave them empty.
  const trap = clean(b.company, 100);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address looks wrong." }, { status: 400 });
  }
  // Silently accept and drop, so the bot sees success and does not retry.
  if (trap) return NextResponse.json({ ok: true });

  // 1. Store it. This is the durable record — email is only a notification.
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("messages").insert({ name, email, message });

  if (dbError) {
    console.error("[contact] insert failed:", dbError.message);
    return NextResponse.json({ error: "That didn't send. Try again shortly." }, { status: 500 });
  }

  // 2. Notify. A failure here must not lose the message.
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[contact] RESEND_API_KEY not set — stored without emailing.");
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    const { data: profile } = await supabase.from("profile").select("email").eq("id", 1).maybeSingle();
    const to = process.env.CONTACT_TO_EMAIL ?? profile?.email;
    if (!to) {
      console.warn("[contact] no recipient configured — stored without emailing.");
      return NextResponse.json({ ok: true, emailed: false });
    }

    const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <contact@shivamg.in>";

    await new Resend(key).emails.send({
      from,
      to,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      text: `${name} <${email}> wrote:\n\n${message}\n\n— sent from the contact form on shivamg.in`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#171717">
          <p style="margin:0 0 4px"><strong>${escapeHtml(name)}</strong></p>
          <p style="margin:0 0 16px">
            <a href="mailto:${escapeHtml(email)}" style="color:#7c3aed">${escapeHtml(email)}</a>
          </p>
          <div style="border-left:3px solid #7c3aed;padding:2px 0 2px 14px;white-space:pre-wrap">${escapeHtml(
            message
          )}</div>
          <p style="margin:22px 0 0;font-size:12px;color:#737373">
            Sent from the contact form on shivamg.in. Reply directly to answer.
          </p>
        </div>`,
    });

    return NextResponse.json({ ok: true, emailed: true });
  } catch (e) {
    // Stored successfully; only the notification failed.
    console.error("[contact] email failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: true, emailed: false });
  }
}
