/**
 * Finds a cover photo for a post on Pexels.
 *
 * Used only as a fallback: a cover supplied with the post always wins. The
 * point is that a generated draft arrives with a usable image instead of none,
 * because a post with no cover shares to LinkedIn with the generic site card
 * and wastes the impression.
 *
 * Attribution is not optional. Pexels' terms require a prominent link to Pexels
 * and, wherever possible, a credit to the photographer linking to the photo's
 * own page. So this returns the credit alongside the URL and the caller stores
 * both — once the file has been re-hosted into our own storage, nothing in the
 * image itself records where it came from, and the chance to attribute it is
 * gone for good.
 *
 * Never throws. A missing cover is a much smaller problem than a lost post.
 */

const ENDPOINT = "https://api.pexels.com/v1/search";
const TIMEOUT_MS = 10_000;

/** How many results to choose between. Picking the top hit every time gives
 *  near-identical covers to posts on related subjects. */
const POOL = 8;

export type PexelsCover = {
  /** Direct image URL, cropped by Pexels to 1200x627 — the OG card's shape. */
  url: string;
  credit: string;
  creditUrl: string;
  /** The photo's page on Pexels. This is what the credit links to. */
  sourceUrl: string;
};

/**
 * Tags make a far better query than a title. Titles are often abstract —
 * "Looking for a Leader, Not a Manager" searched verbatim returns nothing
 * useful — whereas the tags on that same post are "management", "career",
 * "leadership", which are exactly the words a stock library is indexed by.
 */
export function coverQuery(title: string, tags: string[]): string {
  const usable = tags.map((t) => t.trim()).filter(Boolean).slice(0, 2);
  if (usable.length) return usable.join(" ");
  return title.split(/\s+/).slice(0, 4).join(" ");
}

export async function findCover(query: string): Promise<PexelsCover | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key || !query.trim()) return null;

  const url = new URL(ENDPOINT);
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", String(POOL));

  try {
    const res = await fetch(url, {
      headers: { Authorization: key },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`[pexels] search failed: HTTP ${res.status} for "${query}"`);
      return null;
    }

    const data = await res.json();
    const photos = Array.isArray(data?.photos) ? data.photos : [];
    if (!photos.length) {
      console.warn(`[pexels] no results for "${query}"`);
      return null;
    }

    const photo = photos[Math.floor(Math.random() * photos.length)];
    const src = photo?.src?.landscape ?? photo?.src?.large ?? photo?.src?.original;
    if (typeof src !== "string" || !src) return null;

    return {
      url: src,
      credit: typeof photo.photographer === "string" ? photo.photographer : "Unknown",
      creditUrl: typeof photo.photographer_url === "string" ? photo.photographer_url : "",
      sourceUrl: typeof photo.url === "string" ? photo.url : "",
    };
  } catch (e) {
    console.error("[pexels] search error:", e instanceof Error ? e.message : e);
    return null;
  }
}
