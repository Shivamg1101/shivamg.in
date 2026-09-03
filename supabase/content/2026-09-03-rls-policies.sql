-- Row-level security, written down.
--
-- The policies protecting this database were created by hand in the Supabase
-- dashboard and existed nowhere in this repository. That is the real problem
-- this file fixes: the rules deciding who can read the contact inbox were not
-- reviewable, not diffable, and would not survive rebuilding the project. An
-- audit had to probe the live API to discover what they were.
--
-- Everything here is idempotent and states the intended end position rather
-- than a delta, so it can be run against the current database safely and re-run
-- later to confirm nothing has drifted.
--
-- Verified behaviour this preserves (probed against production 2026-09-03):
--   * anonymous SELECT works on the public content tables
--   * anonymous SELECT on messages and chat_usage returns nothing
--   * anonymous UPDATE is refused on every content table
--   * anonymous upload to the blog-covers bucket is refused
--
-- The one deliberate change is to messages: see below.

begin;

alter table public.profile     enable row level security;
alter table public.experience  enable row level security;
alter table public.projects    enable row level security;
alter table public.automations enable row level security;
alter table public.posts       enable row level security;
alter table public.messages    enable row level security;
alter table public.chat_usage  enable row level security;

-- ---------------------------------------------------------------------------
-- Public content: anyone may read, only a signed-in admin may write.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['profile', 'experience', 'automations'] loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);

    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_public_read', t);

    -- One FOR ALL policy covers insert, update and delete. USING governs which
    -- existing rows may be touched; WITH CHECK governs the resulting row, and
    -- both are needed or an update could rewrite a row into a state the policy
    -- would never have allowed to be inserted.
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      t || '_admin_write', t);
  end loop;
end $$;

-- posts and projects additionally hide drafts from the public. The audit could
-- not tell from outside whether this was already the case (there happened to be
-- no drafts at the time), so it is asserted here rather than assumed.
do $$
declare t text;
begin
  foreach t in array array['posts', 'projects'] loop
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);

    execute format(
      'create policy %I on public.%I for select to anon, authenticated
         using (published = true or auth.role() = ''authenticated'')',
      t || '_public_read', t);

    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      t || '_admin_write', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Contact inbox: nobody anonymous reads it, and as of this migration nobody
-- anonymous writes it either.
--
-- Anonymous INSERT used to be permitted because the contact handler wrote as
-- the visitor. That meant the Supabase REST endpoint accepted rows directly,
-- so the honeypot, the length caps, the address validation and the notification
-- throttle were all optional for anyone who skipped the form and posted at the
-- API. The handler now writes with the service role, which bypasses RLS, so
-- this can be closed without breaking the form.
--
-- Order matters on deploy: ship the application change first, then run this.
-- The other way round leaves the form briefly unable to store anything.
-- ---------------------------------------------------------------------------

drop policy if exists messages_public_insert on public.messages;
drop policy if exists messages_anon_insert   on public.messages;
drop policy if exists messages_admin_all     on public.messages;

create policy messages_admin_all on public.messages
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Chat ledger: salted IP hashes and timestamps. Written and pruned by the
-- /api/ask handler with the service role; no client role needs any access.
-- ---------------------------------------------------------------------------

drop policy if exists chat_usage_admin_read on public.chat_usage;

create policy chat_usage_admin_read on public.chat_usage
  for select to authenticated using (true);

commit;

-- After running, confirm from a terminal that the inbox is still private.
-- Both should return an empty array:
--
--   curl "$SUPABASE_URL/rest/v1/messages?select=*" \
--        -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $PUBLISHABLE_KEY"
--   curl "$SUPABASE_URL/rest/v1/chat_usage?select=*" \
--        -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $PUBLISHABLE_KEY"
