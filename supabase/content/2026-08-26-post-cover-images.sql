-- Cover images for blog posts, 2026-08-26
--
-- 1. posts.cover_url  — permanent public URL of the cover image.
-- 2. A public storage bucket to hold them.
--
-- Why a bucket rather than storing the source URL: images arrive from Notion,
-- whose file URLs are signed and expire after about an hour. Linking straight
-- to one would give a post that looks fine for an hour and then shows a broken
-- image forever. The ingest endpoint downloads and re-hosts instead.
--
-- Run in the Supabase SQL editor for project ywadtrevxjvehskdpjwb.

begin;

alter table public.posts
  add column if not exists cover_url text;

comment on column public.posts.cover_url is
  'Public URL of the cover image in the blog-covers bucket. Null means no cover.';

-- Public bucket: covers are shown on a public blog, so anonymous read is the point.
insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do update set public = true;

-- Anonymous read. Writes happen only through the ingest endpoint using the
-- service role key, which bypasses RLS, so no insert policy is needed here.
drop policy if exists "public read blog covers" on storage.objects;
create policy "public read blog covers"
  on storage.objects for select
  using (bucket_id = 'blog-covers');

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'cover_url'
  ) then
    raise exception 'posts.cover_url was not created';
  end if;

  if not exists (select 1 from storage.buckets where id = 'blog-covers') then
    raise exception 'blog-covers bucket was not created';
  end if;
end $$;

commit;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'posts'
order by ordinal_position;
