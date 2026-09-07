-- Applied 2026-09-07 via the Supabase MCP. Recorded here because policies and
-- schema that live only in the dashboard are not reviewable, which is the
-- lesson from 2026-09-03-rls-policies.sql.
--
-- chat_usage started as a rate-limit counter: a salted IP hash and a timestamp.
-- That kept it worthless to anyone who stole it, but it also meant there was no
-- record of what the agent said to anyone - and it speaks to recruiters. Two
-- defects reached live visitors before anyone noticed, both found by accident.
--
-- Additive and nullable, so existing rows and the limiter are untouched.

alter table public.chat_usage
  add column if not exists question text,
  add column if not exists answer   text,
  add column if not exists model    text,
  add column if not exists ms       integer;

comment on column public.chat_usage.question is
  'Visitor question, with emails and phone numbers redacted at write time. Pruned after 30 days.';
comment on column public.chat_usage.answer is
  'Agent reply. Generated from public site content; his own contact address is preserved so routing can be audited.';
comment on column public.chat_usage.model is 'OpenRouter model slug that produced the answer.';
comment on column public.chat_usage.ms is 'Round-trip latency of the model call, milliseconds.';

create index if not exists chat_usage_created_at_idx on public.chat_usage (created_at desc);

-- RLS is unchanged and deliberately policy-free: enabled with no policies denies
-- every client role outright. Only the service role reads this table. Verify:
--
--   curl "$SUPABASE_URL/rest/v1/chat_usage?select=*" \
--        -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $PUBLISHABLE_KEY"
--
-- must return [].
