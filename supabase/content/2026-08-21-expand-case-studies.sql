-- Content update, 2026-08-21
--
-- 1. Expands both case-study bodies into full write-ups. These now render on
--    the new /case-studies/<slug> detail pages; the cards clamp to 4 lines.
--    Blank lines separate paragraphs. A short line ending in ":" renders as a
--    subheading (see the Prose component in the detail page).
-- 2. Links both case studies to the public repo.
-- 3. Adds the n8n Automation Patterns repo as a project.
--
-- Run in the Supabase SQL editor for project ywadtrevxjvehskdpjwb.

begin;

-- ---------------------------------------------------------------- RAG agent
update projects set
  repo_url = 'https://github.com/Shivamg1101/n8n-automation-patterns/tree/main/workflows/rag-support-agent',
  features = array[
    'Answer strictly from retrieved passages, never from model memory',
    'Route refunds, complaints and payment questions to a human regardless of what retrieval returned',
    'Stay correct when the source document is edited, without redeploying anything',
    'Give the escalated human a draft rather than a blank page'
  ],
  body = $body$
An inbound support ticket arrives by webhook. The agent searches a document knowledge base and either answers from what it found or hands the ticket to a human. It never does both, and it never answers from memory.

Why retrieval rather than a fine-tune:

The source document changes — prices, module lists, schedules. A fine-tune goes stale the day the document is edited and cannot be corrected without retraining. Pasting the whole document into the prompt works until the document outgrows the context window, and it pays for every token on every ticket regardless of relevance.

Retrieval keeps the answer tied to a document a non-engineer can edit. Re-run the indexing trigger and the agent is current.

Chunking, and why these numbers:

Documents are split at 800 tokens with 80 tokens of overlap, and the top 8 passages are retrieved per query.

800 is small enough that a retrieved passage is mostly about the thing that matched, and large enough to carry a complete answer such as a pricing table. At 300 the retrieved text kept ending mid-sentence and the model filled the gap by guessing. At 2000 a single chunk spanned three unrelated sections and the relevant sentence got diluted.

The overlap exists because facts straddle boundaries. A course name at the end of one chunk and its price at the start of the next are useless apart. Ten percent overlap was enough that no answer in testing needed two adjacent chunks retrieval had not already pulled together.

Retrieving 8 passages is a recall decision. Precision is cheap here because the model discards irrelevant passages, but a missing passage becomes "I do not have that information" and an unnecessary escalation.

The escalation contract:

The agent does not return prose. It returns a typed object with two fields: the reply text, and a boolean saying whether a human is needed.

This matters more than it looks. If escalation were inferred from the reply text — searching for "I am not sure", say — the routing would depend on phrasing, and phrasing is exactly what a language model varies. Making the escalation flag a separate boolean the model must set turns the decision into data, and a conditional node routes on it deterministically.

The system prompt names the categories that always escalate regardless of what retrieval returned: refunds, complaints, payments, and account-specific questions. These are cases where a fluent, well-grounded answer is still the wrong outcome, because the customer needs a person with authority to act.

Three constraints, because one is not enough:

The tool description tells the agent to search before answering. The system prompt says to answer strictly from what the tool returned. And the prompt names the failure mode explicitly — never invent prices, products or facts.

The third exists because the first two still leave a well-behaved model happy to produce a plausible price when retrieval comes back thin. Naming the specific category of hallucination that would be most damaging works better than a general instruction to be accurate.

What escalation actually sends:

The mail to the team carries the agent's draft reply alongside the customer's question. The retrieval work is already done, so a human edits rather than starting from nothing. That is the difference between an escalation that saves time and one that just moves the ticket.
$body$
where slug = 'rag-support-agent';

-- ------------------------------------------------------- defaulter alerting
update projects set
  repo_url = 'https://github.com/Shivamg1101/n8n-automation-patterns/tree/main/workflows/quota-defaulter-alert',
  features = array[
    'Surface the agent who made zero calls, not just the ones who made some',
    'Adjust targets for walk-in work the phone system cannot see',
    'Stay silent for everyone who met target, so the mail keeps meaning something',
    'Survive one bad address in the roster without losing the rest of the run'
  ],
  body = $body$
Every night this joins a staff roster, a walk-in log and a live telephony feed, works out who missed their call target, mails them with their manager copied, and sends the operations lead one roll-up. It replaced a manager opening a spreadsheet each evening and reading down a column.

Targets adjust for work the phone system cannot see:

A flat call quota punishes whoever was busiest. An agent who spent the afternoon with walk-in visitors made fewer calls because they were doing the job.

So the target is the role quota minus an allowance for each walk-in handled that day. Role quotas differ because the roles differ — someone whose whole day is outbound calling carries a much higher number than a team lead who mostly supervises. Without per-role quotas the report is noise: the same people appear every night for structural reasons, and everyone stops reading it.

The roster is the spine of the join:

This is the part that is easy to get wrong. The join runs from the roster, not from the call data. An agent missing from the telephony feed is recorded as zero calls, not excluded.

Driving the join from the call feed instead would mean an agent who made no calls at all has no row in the feed, and therefore never appears in the report. The worst performer becomes invisible — precisely the case the report exists to surface.

Two related rules follow. Calls under thirty seconds do not count, because without a floor a run of instant redials inflates a total to target without a single conversation. And an unknown role is skipped rather than given a default quota, because a guessed target produces a mail accusing someone of missing a number nobody set.

Exception reporting:

Individual mail goes only to people below target. Everyone else gets nothing.

Silence is the signal. A "you met your target" mail every night trains people to filter the sender, and then the one message that matters gets filtered too.

The operations lead gets a single summary either way, including a positive line when nobody missed. That is one recipient who has actually asked for the daily number, and who needs to be able to tell "everyone hit target" apart from "the workflow did not run".

Failure handling:

Both mail steps continue on error, so one malformed address in the roster cannot stop the rest of the run. The telephony fetch retries three times, because a single upstream blip should not cost the whole night's report.
$body$
where slug = 'mcube-defaulter-alerting';

-- ------------------------------------------------- new project: the repo
-- Delete-then-insert rather than ON CONFLICT, because ON CONFLICT (slug)
-- requires a unique constraint on slug and this script does not assume one.
-- Re-running the whole file is therefore safe.
delete from projects where slug = 'n8n-automation-patterns';

insert into projects (
  slug, title, summary, body, stack, live_url, repo_url,
  highlight, features, category, role, metrics,
  kind, featured, published, sort_order
) values (
  'n8n-automation-patterns',
  'n8n Automation Patterns',
  'Four production automation patterns published as importable workflows with architecture write-ups — and a mutation-tested scanner that gates every commit.',
  $body$
An open-source repository of four automation patterns taken from systems running unattended in production: a retrieval-grounded support agent, spreadsheet-driven account provisioning, access lifecycle reconciliation, and a nightly quota exception report.

Each pattern ships as an importable workflow plus a write-up covering the design decisions and the failure modes that shaped them — why blank means retry, why desired-state reconciliation beats event handling, why the roster drives the join.

The workflows were re-authored against the original architecture rather than transformed from exports, so no original file was ever the input to a published one. A secret scanner gates every commit and fails closed; it is mutation-tested, meaning eight known-bad values injected into a copy are all caught before the scanner is trusted on a clean one.
$body$,
  array['n8n', 'Qdrant', 'Gemini', 'LangChain', 'Google Sheets API', 'Node.js'],
  null,
  'https://github.com/Shivamg1101/n8n-automation-patterns',
  'Production patterns, not toy examples',
  array[
    'Idempotent by construction — every workflow is safe to re-run',
    'Desired-state reconciliation rather than fragile event handling',
    'Ambiguous upstream responses write nothing and retry, instead of writing a guess',
    'Secret scanning that is proven to fail before it is trusted to pass'
  ],
  'Open Source',
  'Authored the patterns, the write-ups and the scanning tooling',
  array['4', 'Patterns published', '8/8', 'Mutation tests caught', '0', 'Secrets in the tree'],
  'project',
  false,
  true,
  35
);

-- Fail loudly rather than committing a partial change.
do $$
declare n int;
begin
  select count(*) into n from projects
   where slug in ('rag-support-agent', 'mcube-defaulter-alerting')
     and length(body) > 1000;
  if n <> 2 then
    raise exception 'expected 2 expanded case studies, found %', n;
  end if;

  if not exists (select 1 from projects where slug = 'n8n-automation-patterns') then
    raise exception 'n8n-automation-patterns row was not inserted';
  end if;
end $$;

commit;

-- Verify
select slug, kind, sort_order, length(body) as body_chars, repo_url
from projects
order by sort_order desc;
