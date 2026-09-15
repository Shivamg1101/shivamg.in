#!/usr/bin/env node
/**
 * Give existing posts a cover photo.
 *
 * The Pexels fallback in /api/posts only runs when a post is created, so every
 * post written before it existed has no cover — and a post with no cover shares
 * to LinkedIn with the generic site-wide card, which wastes the impression.
 *
 * Usage:
 *   node scripts/backfill-covers.mjs --dry-run       # show what it would do
 *   node scripts/backfill-covers.mjs                 # published posts only
 *   node scripts/backfill-covers.mjs --include-drafts
 *
 * Needs two secrets that normally live only in Vercel:
 *   PEXELS_API_KEY              from pexels.com/api
 *   SUPABASE_SERVICE_ROLE_KEY   Supabase -> Settings -> API
 *
 * Build the compiled dependency first:
 *   npx tsc lib/pexels.ts --outDir scripts/compiled --module es2022 --target es2022 --moduleResolution bundler
 *
 * Idempotent: a post that already has a cover is skipped, so re-running after a
 * partial failure only fills the gaps.
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

// The COMPILED lib/pexels.ts, not a copy of its logic, so a backfilled cover is
// chosen exactly the way a new post's cover is.
import { findCover, coverQuery } from "./compiled/pexels.js";

// .env.local already holds the project URL. The two secrets are not in it by
// default and should be passed in the environment, or added temporarily and
// removed again afterwards — a service-role key sitting on disk is a standing
// risk that a one-off script does not justify.
const envLines = fs.existsSync(".env.local")
  ? fs.readFileSync(".env.local", "utf8").split("\n")
  : [];

for (const raw of envLines) {
  const line = raw.trim();
  const i = line.indexOf("=");
  if (i < 1 || line.startsWith("#")) continue;
  const key = line.slice(0, i).trim();
  if (!process.env[key]) {
    process.env[key] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const DRY = process.argv.includes("--dry-run");
const DRAFTS = process.argv.includes("--include-drafts");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "blog-covers";
const MAX_BYTES = 10 * 1024 * 1024;

for (const [name, value] of [
  ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
  ["SUPABASE_SERVICE_ROLE_KEY", SERVICE_KEY],
  ["PEXELS_API_KEY", process.env.PEXELS_API_KEY],
]) {
  if (!value) {
    console.error(`  ${name} is not set. See the header of this file.`);
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

/**
 * Mirrors rehostCover in app/api/posts/route.ts: the same content-type and size
 * checks, so a backfilled cover is indistinguishable from a fresh one — and,
 * more importantly, lands in our own bucket. next.config only permits images
 * from the Supabase host, so a row left pointing at pexels.com would throw at
 * render time rather than degrade.
 */
async function rehost(url, slug) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);

  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const ext = EXT[type];
  if (!ext) throw new Error(`unexpected content-type: ${type || "missing"}`);

  const buf = new Uint8Array(await res.arrayBuffer());
  if (!buf.byteLength || buf.byteLength > MAX_BYTES) {
    throw new Error(`bad size: ${buf.byteLength} bytes`);
  }

  const path = `${slug}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: type, upsert: true });
  if (error) throw new Error(`upload failed: ${error.message}`);

  return {
    publicUrl: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
    bytes: buf.byteLength,
  };
}

let query = supabase
  .from("posts")
  .select("id, slug, title, tags, published, cover_url")
  .is("cover_url", null)
  .order("published", { ascending: false })
  .order("created_at", { ascending: false });

if (!DRAFTS) query = query.eq("published", true);

const { data: posts, error } = await query;
if (error) {
  console.error("  could not read posts:", error.message);
  process.exit(1);
}

console.log(
  `  ${posts.length} post(s) without a cover${DRAFTS ? "" : " (published only)"}` +
    (DRY ? "   DRY RUN — nothing will be written" : "")
);
console.log();

let done = 0;
let failed = 0;

for (const post of posts) {
  const q = coverQuery(post.title, post.tags ?? []);
  console.log(`  ${post.slug}`);
  process.stdout.write(`    query "${q}"  `);

  try {
    const found = await findCover(q);
    if (!found) {
      console.log("-> no result");
      failed++;
      continue;
    }

    if (DRY) {
      console.log(`-> would use ${found.sourceUrl} by ${found.credit}`);
      done++;
      continue;
    }

    const { publicUrl, bytes } = await rehost(found.url, post.slug);

    const { error: upErr } = await supabase
      .from("posts")
      .update({
        cover_url: publicUrl,
        cover_credit: found.credit,
        cover_credit_url: found.creditUrl || null,
        cover_source_url: found.sourceUrl || null,
      })
      .eq("id", post.id);

    if (upErr) throw new Error(`row update failed: ${upErr.message}`);

    console.log(`-> ${Math.round(bytes / 1024)}KB by ${found.credit}`);
    done++;
  } catch (e) {
    console.log(`-> FAILED: ${e instanceof Error ? e.message : e}`);
    failed++;
  }

  // Well inside the 200/hour limit, but no reason to hammer it.
  await new Promise((r) => setTimeout(r, 400));
}

console.log(`\n  ${done} done, ${failed} failed`);
if (!DRY && done) console.log("  Covers are live immediately; pages revalidate within a minute.");
process.exit(failed && !done ? 1 : 0);
