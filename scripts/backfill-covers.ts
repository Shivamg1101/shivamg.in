/**
 * Give every post without a cover a relevant one from Pexels.
 *
 *   npm run backfill:covers                              # dry run, every post
 *   npm run backfill:covers -- --published-only          # dry run, live posts only
 *   npm run backfill:covers -- --published-only --apply
 *   npm run backfill:covers -- --slug=some-post --apply
 *
 * --published-only is usually what you want: a draft picks up a cover on its own
 * when it goes out through the ingest endpoint, so filling one early only spends
 * a photo and a storage object on a post that may never run.
 *
 * Dry run is the default on purpose. The interesting failure here is not an
 * error, it is a plausible-looking photograph of the wrong subject, and the only
 * way to catch that is to read the picks before they are written. Every line of
 * the dry run prints the query that found the photo and a link to it.
 *
 * The choice is seeded on the slug, so the --apply run writes exactly what the
 * dry run showed. If one post's pick is wrong, give it a different photograph
 * without disturbing the others:
 *
 *   npm run backfill:covers -- --slug=some-post --reroll=2
 *   npm run backfill:covers -- --slug=some-post --reroll=2 --apply
 *
 * Only posts whose cover_url is null are touched, so this is safe to re-run and
 * will never replace a cover that is already there — including one chosen by
 * hand in the CMS.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY (writes to posts bypass RLS, and Storage
 * uploads need it) and PEXELS_API_KEY in .env.local. The npm script loads that
 * file through node --env-file.
 */

import { createClient } from "@supabase/supabase-js";
import { findCoverForPost, photoIdFrom } from "../lib/pexels.ts";
import { rehostCover } from "../lib/cover-storage.ts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const apply = process.argv.includes("--apply");
const publishedOnly = process.argv.includes("--published-only");
const onlySlug = process.argv.find((a) => a.startsWith("--slug="))?.slice("--slug=".length);
/** Shifts the seed, so a post whose pick is genuinely wrong can be given a
 *  different one. Same number always gives the same photo back. */
const reroll = process.argv.find((a) => a.startsWith("--reroll="))?.slice("--reroll=".length) ?? "";

function fail(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

if (!SUPABASE_URL) fail("NEXT_PUBLIC_SUPABASE_URL is not set.");
if (!SERVICE_KEY) fail("SUPABASE_SERVICE_ROLE_KEY is not set — it is needed to write posts and upload to Storage.");
if (!process.env.PEXELS_API_KEY) fail("PEXELS_API_KEY is not set. Create one free at https://www.pexels.com/api/.");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Row = {
  id: string;
  slug: string;
  title: string;
  tags: string[] | null;
  published: boolean;
  cover_url: string | null;
  cover_source_url: string | null;
};

// Every row, not just the targets: the ids of covers already in use have to come
// from the whole table, or the run hands a second post a photo that a filtered-out
// row is already using.
const { data: all, error } = await supabase
  .from("posts")
  .select("id, slug, title, tags, published, cover_url, cover_source_url")
  .order("published_at", { ascending: false, nullsFirst: false });

if (error) fail(`Could not read posts: ${error.message}`);

const rows = (all ?? []) as Row[];
const used = new Set<string>();
for (const r of rows) {
  const id = photoIdFrom(r.cover_source_url);
  if (id) used.add(id);
}

let targets = rows.filter((r) => !r.cover_url);
if (publishedOnly) targets = targets.filter((r) => r.published);
if (onlySlug) targets = targets.filter((r) => r.slug === onlySlug);

if (!targets.length) {
  if (onlySlug) console.log(`\n  No post named "${onlySlug}" is missing a cover.\n`);
  else if (publishedOnly) console.log("\n  Every published post already has a cover.\n");
  else console.log("\n  Every post already has a cover.\n");
  process.exit(0);
}

const scope = publishedOnly ? "published post(s)" : "post(s)";
console.log(`\n  ${apply ? "Applying" : "Dry run"} — ${targets.length} ${scope} without a cover.\n`);

let filled = 0;
const skipped: string[] = [];

for (const post of targets) {
  // Seeded on the slug so this run and the --apply that follows it choose the
  // same photograph. Without that the dry run previews one picture and writes
  // another, and reviewing the picks proves nothing.
  const found = await findCoverForPost(post.title, post.tags ?? [], used, `${post.slug}${reroll}`);

  if (!found) {
    skipped.push(post.slug);
    console.log(`  ─  ${post.slug}\n     no relevant photo — left without a cover\n`);
    continue;
  }

  // Reserved even on a dry run, so the run previews the same spread of photos
  // it would actually write.
  used.add(found.id);

  console.log(`  ${apply ? "+" : "·"}  ${post.slug}`);
  console.log(`     query  "${found.query}"`);
  console.log(`     photo  ${found.credit} — ${found.sourceUrl}`);

  if (!apply) {
    console.log();
    continue;
  }

  const coverUrl = await rehostCover(found.url, post.slug, supabase);
  if (!coverUrl) {
    skipped.push(post.slug);
    console.log(`     FAILED to re-host — row left unchanged\n`);
    continue;
  }

  // Credit is written in the same statement as the URL. Attribution that can be
  // lost by a half-applied update is attribution Pexels' terms do not have.
  const { error: writeError } = await supabase
    .from("posts")
    .update({
      cover_url: coverUrl,
      cover_credit: found.credit,
      cover_credit_url: found.creditUrl || null,
      cover_source_url: found.sourceUrl || null,
    })
    .eq("id", post.id);

  if (writeError) {
    skipped.push(post.slug);
    console.log(`     FAILED to save: ${writeError.message}\n`);
    continue;
  }

  filled++;
  console.log(`     saved\n`);
}

console.log(`  ${apply ? `Done — ${filled} filled` : `Would fill ${targets.length - skipped.length}`}, ${skipped.length} without a cover.`);
if (skipped.length) console.log(`  Without a cover: ${skipped.join(", ")}`);
if (!apply) console.log(`\n  Nothing was written. Re-run with --apply to save these.`);
console.log();
