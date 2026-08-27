import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

/**
 * Draft ingest for the automation pipeline.
 *
 * n8n POSTs a generated post here. Three rules make this safe to expose:
 *
 *  1. It can only ever create a DRAFT. `published` is hard-coded false and the
 *     payload's own value is ignored, so a compromised token cannot put text on
 *     the live site — the worst it can do is fill the CMS with junk.
 *  2. The token is compared in constant time, so the endpoint cannot be used as
 *     an oracle to recover it byte by byte.
 *  3. Everything is length-capped and the slug is rewritten from scratch rather
 *     than trusted, so no payload can produce a surprising URL.
 */

const LIMITS = { title: 200, excerpt: 400, body: 60_000, tag: 40, tags: 8 };
const COVER = { maxBytes: 10 * 1024 * 1024, timeoutMs: 15_000 };

const COVER_BUCKET = "blog-covers";

/**
 * Fetching a caller-supplied URL server-side is an SSRF primitive, so the URL
 * is constrained before we touch it:
 *
 *  - https only, so file:// and http:// to a plaintext internal service are out.
 *  - No credentials in the URL.
 *  - Hostname must not be localhost or a literal private/link-local address —
 *    including the cloud metadata endpoint at 169.254.169.254, which is the
 *    classic target.
 *
 * The remaining gap is a public hostname that resolves to a private address.
 * Closing that needs DNS resolution plus a pinned-IP fetch, which is more
 * machinery than this is worth: the endpoint is already behind a bearer token,
 * and the only thing an attacker could learn is whether an internal host serves
 * something image-shaped.
 */
function safeImageUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }

  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;

  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "[::1]") return null;

  // Literal IPv4 in a private, loopback, link-local or CGNAT range.
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 10 || a === 127 || a === 0) return null;
    if (a === 172 && b >= 16 && b <= 31) return null;
    if (a === 192 && b === 168) return null;
    if (a === 169 && b === 254) return null; // cloud metadata
    if (a === 100 && b >= 64 && b <= 127) return null;
  }
  if (host.startsWith("[")) return null; // bare IPv6 literal

  return u;
}

/**
 * Download a cover image and re-host it, returning a permanent public URL.
 *
 * Source URLs from Notion are signed and expire in about an hour, so storing
 * one directly would produce a post that looks right today and shows a broken
 * image next week. Never throws: a missing cover is much cheaper than a lost
 * post, so failure returns null and the post is created without one.
 */
async function rehostCover(
  rawUrl: string,
  slug: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const url = safeImageUrl(rawUrl);
  if (!url) {
    console.warn("[posts] cover rejected: unsafe or malformed URL");
    return null;
  }

  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(COVER.timeoutMs),
    });
    if (!res.ok) {
      console.warn(`[posts] cover fetch failed: HTTP ${res.status}`);
      return null;
    }

    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type];
    if (!ext) {
      console.warn(`[posts] cover rejected: content-type ${type || "missing"}`);
      return null;
    }

    // Trust the body, not the header: Content-Length can lie or be absent.
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > COVER.maxBytes) {
      console.warn(`[posts] cover rejected: ${buf.byteLength} bytes`);
      return null;
    }

    const path = `${slug}.${ext}`;
    const { error } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(path, buf, { contentType: type, upsert: true });

    if (error) {
      console.error("[posts] cover upload failed:", error.message);
      return null;
    }

    return supabase.storage.from(COVER_BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (e) {
    console.error("[posts] cover re-host failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INGEST_TOKEN = process.env.POST_INGEST_TOKEN;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shivamg.in";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Tell the author a draft is waiting. Sent from our own domain via Resend so the
 * pipeline has no dependency on any third-party mailbox.
 *
 * Never throws: the draft is already saved by the time this runs, and losing a
 * notification is much cheaper than losing the post.
 */
async function notify(
  post: {
    title: string;
    excerpt: string | null;
    slug: string;
    tags: string[];
    words: number;
  },
  fallbackTo: string | null
) {
  const key = process.env.RESEND_API_KEY;
  // Env override first, then the address on the profile row — so this works
  // with no extra configuration.
  const to = process.env.DRAFT_TO_EMAIL ?? process.env.CONTACT_TO_EMAIL ?? fallbackTo;
  if (!key || !to) return false;

  const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <contact@shivamg.in>";
  const review = `${SITE}/admin/posts`;
  const tagLine = post.tags.length ? post.tags.join(", ") : "none";

  try {
    await new Resend(key).emails.send({
      from,
      to,
      subject: `Draft ready — ${post.title}`,
      text:
        `A new draft is waiting in your CMS.\n\n` +
        `${post.title}\n${post.excerpt ?? ""}\n\n` +
        `${post.words} words · ${Math.max(1, Math.round(post.words / 225))} min read\n` +
        `Tags: ${tagLine}\nSlug: ${post.slug}\n\n` +
        `Review and publish: ${review}\n\n` +
        `It stays unpublished until you flip the Published toggle.`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#171717">
          <p style="margin:0 0 18px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7c3aed;font-weight:700">
            Draft ready for review
          </p>
          <h1 style="margin:0 0 10px;font-size:20px;line-height:1.35">${escapeHtml(post.title)}</h1>
          ${post.excerpt ? `<p style="margin:0 0 18px;color:#525252">${escapeHtml(post.excerpt)}</p>` : ""}
          <p style="margin:0 0 22px;font-size:13px;color:#737373">
            ${post.words} words · ${Math.max(1, Math.round(post.words / 225))} min read<br>
            Tags: ${escapeHtml(tagLine)}
          </p>
          <a href="${review}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;font-weight:600;font-size:14px">
            Review and publish
          </a>
          <p style="margin:22px 0 0;font-size:12px;color:#737373">
            Nothing is public until you flip the Published toggle in the CMS.
          </p>
        </div>`,
    });
    return true;
  } catch (e) {
    console.error("[posts] notification failed:", e instanceof Error ? e.message : e);
    return false;
  }
}

function authorised(header: string | null): boolean {
  if (!INGEST_TOKEN || !header) return false;
  const presented = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(presented);
  const b = Buffer.from(INGEST_TOKEN);
  // timingSafeEqual throws on length mismatch, so compare digests instead —
  // equal-length inputs regardless of what was presented.
  return crypto.timingSafeEqual(
    crypto.createHash("sha256").update(a).digest(),
    crypto.createHash("sha256").update(b).digest()
  );
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Built from the title, never taken from the payload. */
function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70)
    .replace(/^-|-$/g, "");
  return base || "post";
}

export async function POST(request: Request) {
  if (!SERVICE_KEY || !INGEST_TOKEN) {
    // Misconfiguration, not a client error — do not hint at which is missing.
    return NextResponse.json({ error: "Ingest is not configured." }, { status: 503 });
  }

  if (!authorised(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const title = str(b.title, LIMITS.title);
  const excerpt = str(b.excerpt, LIMITS.excerpt);
  const text = str(b.body, LIMITS.body);

  if (!title || !text) {
    return NextResponse.json({ error: "title and body are required." }, { status: 400 });
  }
  if (text.length < 200) {
    return NextResponse.json({ error: "Body is too short to be a real post." }, { status: 400 });
  }

  const tags = Array.isArray(b.tags)
    ? [...new Set(b.tags.map((t) => str(t, LIMITS.tag)).filter(Boolean))].slice(0, LIMITS.tags)
    : [];

  // Service role: this route is server-only and writes on behalf of the
  // automation, which has no Supabase user of its own.
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Slugs must be unique; suffix until one is free rather than overwriting an
  // existing post, which would silently destroy something already published.
  const base = slugify(title);
  let slug = base;
  for (let n = 2; n <= 50; n++) {
    const { data: clash } = await supabase.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${base}-${n}`;
  }

  // Re-hosted before the insert so the row is written once, with its final URL.
  const rawCover = str(b.cover_image_url, 2000);
  const coverUrl = rawCover ? await rehostCover(rawCover, slug, supabase) : null;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title,
      excerpt: excerpt || null,
      body: text,
      cover_url: coverUrl,
      tags,
      published: false, // never publishable through this endpoint
      published_at: null,
    })
    .select("id, slug")
    .single();

  if (error) {
    console.error("post ingest failed:", error.message);
    return NextResponse.json({ error: "Could not save the draft." }, { status: 500 });
  }

  const words = text.split(/\s+/).filter(Boolean).length;

  const { data: profile } = await supabase
    .from("profile")
    .select("email")
    .eq("id", 1)
    .maybeSingle();

  const notified = await notify(
    { title, excerpt: excerpt || null, slug, tags, words },
    profile?.email ?? null
  );

  return NextResponse.json({
    ok: true,
    id: data.id,
    slug: data.slug,
    status: "draft",
    words,
    // Explicit rather than implied: a cover that was supplied but failed to
    // re-host reports false, so the caller can tell the difference between
    // "no image wanted" and "image lost".
    cover: rawCover ? coverUrl !== null : null,
    notified,
    review_url: `${SITE}/admin/posts`,
  });
}

/** Anything other than POST is a mistake worth surfacing loudly. */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
