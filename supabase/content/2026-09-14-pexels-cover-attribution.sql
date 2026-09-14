-- Cover attribution for Pexels photos.
--
-- Pexels' terms require a prominent link to Pexels and, wherever possible, a
-- credit to the photographer linking to the photo's own page. Storing the
-- credit next to the image is what makes that possible at render time: once the
-- file has been re-hosted into our own Supabase bucket, nothing in it records
-- where it came from, and the chance to attribute it is gone for good.
--
-- All three columns are nullable, so every existing post and every
-- hand-supplied cover is unaffected. A null cover_credit simply renders no
-- credit line.

alter table public.posts
  add column if not exists cover_credit     text,
  add column if not exists cover_credit_url text,
  add column if not exists cover_source_url text;

comment on column public.posts.cover_credit is
  'Photographer name, e.g. "John Doe". Null for covers that need no attribution.';
comment on column public.posts.cover_credit_url is
  'Photographer profile URL on the source site.';
comment on column public.posts.cover_source_url is
  'Page for the photo itself, which is what the credit links to.';

-- RLS is unchanged. posts already has "posts public read" (published only) and
-- "posts admin write" gated on is_admin(); new columns inherit both.
