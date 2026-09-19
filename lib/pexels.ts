/**
 * Finds a cover photo for a post on Pexels.
 *
 * Used by the draft ingest endpoint, where a cover supplied with the post always
 * wins and this is only the fallback, and by scripts/backfill-covers.ts, which
 * fills in posts written before any of this existed. The point is that a post
 * arrives with a usable image instead of none, because a post with no cover
 * shares to LinkedIn with the generic site card and wastes the impression.
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
  /** Pexels' own photo id, used to keep one photo off two different posts. */
  id: string;
  /** Direct image URL, cropped by Pexels to 1200x627 — the OG card's shape. */
  url: string;
  credit: string;
  creditUrl: string;
  /** The photo's page on Pexels. This is what the credit links to. */
  sourceUrl: string;
  /** Which query actually found it. Worth returning: it is the only way to see
   *  why a post ended up with the picture it did. */
  query: string;
};

/**
 * Tags a stock library cannot search, mapped to something it can.
 *
 * Two separate problems make the raw tags unusable as queries:
 *
 *  - Most of them return nothing. No stock library has photographs of "n8n",
 *    "chunking" or "embeddings", so searching for one yields an empty result
 *    and the post silently gets no cover.
 *  - A few return the wrong thing confidently, which is worse. "rag" returns
 *    cleaning cloths. "agents" returns estate agents shaking hands. Those come
 *    back as perfectly good photographs of the wrong subject, and nothing
 *    downstream can tell that they are wrong.
 *
 * So each tag this blog actually uses is mapped to the visual idea behind it.
 * Several map to the same concept on purpose — a retrieval post and an
 * embeddings post want the same kind of picture.
 *
 * Add a line here when a new tag appears. An unmapped tag is still tried
 * verbatim, which is fine for ordinary English ("travel", "learning") and is
 * exactly the false-friend risk above for jargon.
 */
const CONCEPTS: Record<string, string> = {
  // Models and agents.
  //
  // Not "artificial intelligence": that query returns eight humanoid robots out
  // of eight — glowing eyes, LED faces, one person in a robot costume. It is the
  // stock-photo cliché for the subject and it makes a technical post look
  // unserious. Abstract network imagery is the closest honest picture of a model.
  "ai": "abstract network connections",
  "llm": "abstract network connections",
  "llms": "abstract network connections",
  "llm architecture": "abstract network connections",
  "agents": "robotics laboratory",
  "ai agents": "robotics laboratory",

  // Retrieval. An archive is the honest picture of what RAG does.
  "rag": "library archive shelves",
  "retrieval augmented generation": "library archive shelves",
  "retrieval": "library archive shelves",
  "vector search": "library archive shelves",
  "embeddings": "library archive shelves",
  "chunking": "library archive shelves",

  // Automation and the infrastructure under it.
  //
  // Not "automation machinery": that returns factory floors, robotic arms and 3D
  // printers. The automation here is software — a workflow moving rows between
  // APIs — and an industrial press is a picture of a different trade entirely.
  "n8n": "source code on screen",
  "automation": "source code on screen",
  "workflow": "source code on screen",
  "devops": "server room data center",
  "reliability": "server room data center",
  "infrastructure": "server room data center",
  "system design": "server room data center",
  "architecture": "server room data center",
  "engineering": "server room data center",
  "software engineering": "server room data center",
  "security": "cyber security",
  "open source": "programmer writing code",

  // Work, and the people doing it.
  "career": "office desk workspace",
  "job application": "office desk workspace",
  "work": "office desk workspace",
  "management": "team meeting office",
  "leadership": "team meeting office",
  "colleagues": "team meeting office",
  "rejection": "person thinking at laptop",
  "creators": "creative workspace desk",
  "publishing": "creative workspace desk",
  "personal projects": "creative workspace desk",
  "learning": "studying with notebook",
  "video": "video camera filming",

  // Places.
  "travel": "travel landscape",
  "mountains": "mountain landscape",
  "tungnath": "himalaya mountains",
};

/**
 * The photo id out of a Pexels photo-page URL, whose last path segment is it:
 * https://www.pexels.com/photo/robot-pointing-on-a-wall-8386440/ -> "8386440".
 *
 * `cover_source_url` is the only record of which photograph a post uses, since
 * the re-hosted file keeps nothing about where it came from. Reading the ids back
 * out is what stops one photo being handed to two posts.
 */
export function photoIdFrom(sourceUrl: string | null | undefined): string | null {
  const m = sourceUrl?.match(/(\d+)\/?$/);
  return m ? m[1] : null;
}

/** Tag text and map keys have to agree, so "vector-search" and "Vector Search"
 *  both have to arrive as "vector search". */
function normalise(tag: string): string {
  return tag.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "how",
  "in", "is", "it", "its", "my", "not", "of", "on", "or", "our", "that", "the",
  "to", "was", "what", "when", "why", "with", "you", "your",
]);

/**
 * The queries to try, most specific first.
 *
 * One query is not enough. Tags are ordered roughly by importance, so the first
 * two together describe the post best — but the more words in a stock search the
 * likelier it returns nothing at all, and a post with no cover is the thing this
 * exists to prevent. Hence a ladder: narrow enough to be about the post at the
 * top, broad enough to return something by the bottom.
 *
 * The ladder still ends. If no rung returns a photograph the post keeps no
 * cover, which is the intended outcome — an image with nothing to do with the
 * writing is worse than none, because the reader reads it as a claim about the
 * piece.
 */
export function coverQueries(title: string, tags: string[]): string[] {
  const concepts: string[] = [];
  for (const tag of tags) {
    const key = normalise(tag);
    if (!key) continue;
    // Unmapped tags are tried as they are; see the note on CONCEPTS.
    concepts.push(CONCEPTS[key] ?? key);
  }

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const ladder = [
    // The two leading tags together, when they are not the same concept.
    concepts[0] && concepts[1] && concepts[0] !== concepts[1]
      ? `${concepts[0]} ${concepts[1]}`
      : "",
    // Then each concept on its own, in tag order.
    ...concepts,
    // Then the title, which is a poor query — abstract titles like "Looking for
    // a Leader, Not a Manager" describe no photograph — but occasionally the
    // only thing left when every tag is jargon.
    words.slice(0, 3).join(" "),
    words.slice(0, 2).join(" "),
  ];

  return [...new Set(ladder.map((q) => q.trim()).filter(Boolean))];
}

/**
 * An https URL, or "" — for the two credit links, which are stored and later
 * rendered straight into an href.
 *
 * The values come from Pexels' JSON, so this is not a live attack; it is about
 * not depending on the browser to save us. React neutralises `javascript:` but
 * passes `vbscript:` and `data:text/html` through untouched, and those are inert
 * only because current browsers refuse them. Refusing anything that is not https
 * at the point of storage means the render path cannot be handed a scheme it has
 * to be clever about, whatever a future browser decides to allow.
 */
function httpsOnly(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    return new URL(value).protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}

/**
 * Which of the pool to take, derived from a seed rather than drawn at random.
 *
 * Randomness here quietly broke the one safeguard that matters. The backfill's
 * dry run exists so a wrong-looking photograph can be rejected before it is
 * written, but a random pick means the --apply run chooses a *different* photo
 * from the same pool, so what was reviewed is not what lands. Seeding on the slug
 * makes the two runs agree while still spreading different posts across the pool.
 *
 * FNV-1a: short, no dependency, and good enough to scatter a handful of slugs.
 */
function seededIndex(seed: string, length: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % length;
}

/**
 * One search. Returns null for every failure, including "no results", so the
 * caller can simply try the next rung of the ladder.
 *
 * `exclude` carries photo ids already used by other posts. Without it a backfill
 * gives the same archive shelves to all five retrieval posts, because they
 * deliberately share a query.
 *
 * `seed` makes the choice repeatable — pass the post's slug. Omitting it falls
 * back to a random pick, which is fine for a caller that writes immediately and
 * has nothing to reconcile with a preview.
 */
export async function findCover(
  query: string,
  exclude: ReadonlySet<string> = new Set(),
  seed?: string
): Promise<PexelsCover | null> {
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
    const all = Array.isArray(data?.photos) ? data.photos : [];
    const photos = all.filter((p: { id?: unknown }) => !exclude.has(String(p?.id)));
    if (!photos.length) return null;

    const photo =
      photos[
        seed === undefined
          ? Math.floor(Math.random() * photos.length)
          : seededIndex(`${seed}|${query}`, photos.length)
      ];
    const src = photo?.src?.landscape ?? photo?.src?.large ?? photo?.src?.original;
    if (typeof src !== "string" || !src) return null;

    return {
      id: String(photo.id),
      url: src,
      credit: typeof photo.photographer === "string" ? photo.photographer : "Unknown",
      creditUrl: httpsOnly(photo.photographer_url),
      sourceUrl: httpsOnly(photo.url),
      query,
    };
  } catch (e) {
    console.error("[pexels] search error:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Walk the ladder and take the first photograph it finds. Pass `seed` (the
 *  post's slug) when the choice has to be repeatable — see findCover. */
export async function findCoverForPost(
  title: string,
  tags: string[],
  exclude: ReadonlySet<string> = new Set(),
  seed?: string
): Promise<PexelsCover | null> {
  for (const query of coverQueries(title, tags)) {
    const found = await findCover(query, exclude, seed);
    if (found) return found;
  }
  console.warn(`[pexels] nothing relevant for "${title}" — leaving it without a cover`);
  return null;
}
