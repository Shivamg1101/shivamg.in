import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for public page data.
 *
 * The cookie-aware client in ./server.ts calls `cookies()`, and in the App
 * Router any access to `cookies()` opts the whole route out of static
 * rendering. Every public page was therefore server-rendering and hitting the
 * database on every single request, with `revalidate` silently doing nothing —
 * roughly a second of TTFB on every navigation, never cached.
 *
 * Public pages read public rows through the publishable key and RLS. They have
 * no session to read, so they should not be touching cookies at all. Using this
 * client instead lets Next cache and revalidate the pages as intended.
 *
 * Anything that needs the signed-in admin session must keep using ./server.ts.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
