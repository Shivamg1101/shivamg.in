/** Single source of truth for absolute URLs used in metadata and JSON-LD. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://shivamg.in";

export const SITE_NAME = "Shivam Gupta";
