-- Rate-limit ledger for the site chat agent, 2026-09-03
--
-- Serverless functions share no memory between invocations, so an in-process
-- counter would reset constantly and enforce nothing. The limit has to live
-- somewhere durable, and the database is already there.
--
-- IPs are stored as a salted SHA-256 hash, never in the clear. The hash is only
-- ever compared against itself to count one visitor's requests, so the raw
-- address is never needed and shouldn't be kept.
--
-- Run in the Supabase SQL editor for project ywadtrevxjvehskdpjwb.

begin;

create table if not exists public.chat_usage (
  id          bigserial primary key,
  ip_hash     text        not null,
  created_at  timestamptz not null default now()
);

comment on table public.chat_usage is
  'One row per answered chat message. Used only for rate limiting; pruned after 2 days.';
comment on column public.chat_usage.ip_hash is
  'Salted SHA-256 of the caller IP. Never store the raw address.';

-- Counting "today, globally" and "today, this visitor" are the only two reads.
create index if not exists chat_usage_created_idx on public.chat_usage (created_at desc);
create index if not exists chat_usage_ip_created_idx on public.chat_usage (ip_hash, created_at desc);

-- Nobody but the server should see this. The route uses the service role key,
-- which bypasses RLS, so enabling it with no policy denies everyone else.
alter table public.chat_usage enable row level security;

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'chat_usage'
  ) then
    raise exception 'chat_usage was not created';
  end if;
end $$;

commit;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'chat_usage'
order by ordinal_position;
