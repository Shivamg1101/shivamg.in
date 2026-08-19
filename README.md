# shivamg.in

My portfolio, and the CMS behind it. Built with Next.js 16 and Supabase.

Live at **[shivamg.in](https://shivamg.in)**.

Nothing on the public site is hard-coded — the profile, roles, projects, case
studies and the automation catalogue all come out of Postgres and are edited
through an admin panel at `/admin`. The stat that reads "10 automations in
production" is a live count of rows, not a number typed into a component.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind v4, CSS-variable design tokens, light and dark themes |
| Motion | Framer Motion — scroll-linked timeline, cursor-tracking card borders |
| Data | Supabase — Postgres, Auth, row-level security |
| Mail | Resend, behind a server route |

## Layout

```
app/
  (site)/            public pages, sharing one layout
    page.tsx         hero, bento grid, stats, approach
    about/           tabbed profile, skill matrix, expertise
    experience/      alternating timeline, scroll-driven fill
    projects/        project grid + automation catalogue
    case-studies/    architecture deep dives
    contact/         form, posts to the API route
  admin/             CMS, auth-gated in proxy.ts
  api/contact/       validates, stores, then emails
components/
  motion.tsx         shared animation primitives
  structured-data.tsx  JSON-LD generated from the database
lib/
  admin-schema.ts    field definitions that drive the whole CMS
  supabase/          browser and server clients
```

## The CMS

`lib/admin-schema.ts` declares the fields for each collection, and a single
generic editor renders the list and form for all of them. Adding a column to
the admin panel is a few lines in that one file, not a new page.

Collections: profile, experience, projects, automations, write-ups, and
contact messages.

## Security

- Row-level security on every table. Anonymous users may read published rows
  and insert a contact message; nothing else.
- Writes are gated on an `admins` email allowlist through a security-definer
  function. The allowlist table has RLS enabled and no policies, so it is
  unreachable through the API.
- The contact endpoint validates server-side, mirrors the database
  constraints, and drops bot submissions with a honeypot.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase project
npm run dev
```

`RESEND_API_KEY` is optional. Without it, contact submissions are still
stored — email is only a notification, never the record.

## Credits

Design direction adapted from [ali-ch.dev](https://www.ali-ch.dev), with the
content, data model and implementation my own.
