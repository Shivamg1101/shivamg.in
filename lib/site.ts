/** Single source of truth for absolute URLs used in metadata and JSON-LD. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://shivamg.in";

export const SITE_NAME = "Shivam Gupta";

/** The headshot in /public (also the header avatar), used for Person JSON-LD. */
export const PERSON_IMAGE = { path: "/shivam.png", width: 160, height: 160 } as const;

/**
 * Build page metadata consistently.
 *
 * Declaring `openGraph` on a page suppresses Next's automatic file-based
 * opengraph-image for that route, so the image has to be named explicitly.
 * Going through this helper keeps every page's card intact.
 */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website" as const,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
