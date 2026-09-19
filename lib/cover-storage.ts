/**
 * Downloading a cover image and re-hosting it in our own Storage bucket.
 *
 * Shared by the two things that attach covers: the draft ingest endpoint, which
 * takes whatever URL a brief supplies, and the backfill script, which takes one
 * from the Pexels API. Both need the same SSRF guards and the same bucket, and
 * duplicating security-sensitive code so that only one copy later gets fixed is
 * how the two drift apart.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
// Explicit .ts extension: this module is imported both by Next (bundled) and by
// scripts/backfill-covers.ts under node's type stripping, and node's ESM
// resolver will not guess the extension.
import { photoIdFrom } from "./pexels.ts";

export const COVER = { maxBytes: 10 * 1024 * 1024, timeoutMs: 15_000 };

export const COVER_BUCKET = "blog-covers";

/**
 * Pexels photo ids already spoken for by an existing post.
 *
 * Passed to findCoverForPost so a new draft does not land on a photograph the
 * blog already shows. Posts on related subjects deliberately share a query — the
 * five retrieval posts all search "library archive shelves" — so without this
 * they converge on whichever photo Pexels ranks first.
 *
 * Returns an empty set on failure. Repeating a photo is a cosmetic problem and
 * is not worth failing an ingest over.
 */
export async function usedPhotoIds(supabase: SupabaseClient): Promise<Set<string>> {
  const used = new Set<string>();
  const { data, error } = await supabase
    .from("posts")
    .select("cover_source_url")
    .not("cover_source_url", "is", null);

  if (error) {
    console.warn("[posts] could not read existing covers, allowing repeats:", error.message);
    return used;
  }

  for (const row of data ?? []) {
    const id = photoIdFrom((row as { cover_source_url: string | null }).cover_source_url);
    if (id) used.add(id);
  }
  return used;
}

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
 * Redirects are followed by hand in rehostCover so that every hop comes back
 * through this function; letting fetch follow them would make the checks above
 * decorative, since only the first URL would ever be examined.
 *
 * The remaining gap is a public hostname that resolves to a private address.
 * Closing that needs DNS resolution plus a pinned-IP fetch, which is more
 * machinery than this is worth: the endpoint is already behind a bearer token,
 * and the only thing an attacker could learn is whether an internal host serves
 * something image-shaped.
 */
export function safeImageUrl(raw: string): URL | null {
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
export async function rehostCover(
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
    // Following redirects automatically would undo every check above: the first
    // URL passes safeImageUrl, then a 302 sends the fetch wherever the attacker
    // likes — including the addresses the allowlist exists to refuse. Each hop
    // is therefore resolved by hand and re-validated before it is followed.
    let res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(COVER.timeoutMs) });
    for (let hop = 0; res.status >= 300 && res.status < 400 && hop < 4; hop++) {
      const location = res.headers.get("location");
      if (!location) break;

      const next = safeImageUrl(new URL(location, res.url).toString());
      if (!next) {
        console.warn("[posts] cover rejected: redirect to an unsafe address");
        return null;
      }
      res = await fetch(next, { redirect: "manual", signal: AbortSignal.timeout(COVER.timeoutMs) });
    }

    if (res.status >= 300 && res.status < 400) {
      console.warn("[posts] cover rejected: too many redirects");
      return null;
    }
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
