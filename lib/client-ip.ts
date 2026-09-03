import crypto from "crypto";

/**
 * The caller's IP, as a salted hash.
 *
 * The subtlety is which header to believe. `x-forwarded-for` is a chain, and a
 * client can put whatever it likes at the front of it — so reading the FIRST
 * entry hands any per-visitor limit straight to the attacker, who just varies
 * the header to look like a new person on every request. Vercel sets
 * `x-vercel-forwarded-for` and `x-real-ip` itself and they cannot be forged
 * from outside, so those come first; the last entry of `x-forwarded-for` is the
 * fallback, because a proxy appends the address it actually saw.
 *
 * The salt is a dedicated secret. An IPv4 address has only ~4 billion possible
 * values, so an unsalted or publicly-salted hash of one is not anonymous at
 * all — the whole space can be enumerated in seconds. If no salt is configured
 * the function says so rather than quietly falling back to a constant, because
 * a constant would turn this ledger into recoverable addresses.
 */
export function hashClientIp(req: Request): { hash: string; salted: boolean } {
  const xff = req.headers.get("x-forwarded-for");
  const chain = xff ? xff.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const ip =
    req.headers.get("x-vercel-forwarded-for")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    chain[chain.length - 1] ||
    "unknown";

  const salt = process.env.IP_HASH_SALT;
  const effective = salt ?? "unsalted";

  return {
    hash: crypto.createHash("sha256").update(`${effective}:${ip}`).digest("hex").slice(0, 32),
    salted: Boolean(salt),
  };
}
