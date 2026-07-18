# Project plan

## Existing state

The repository contained a polished single-page prototype, a GPT Sites worker,
and one Supabase table mixing public and private information. The visual work is
useful, but the data model and authentication are not suitable for a public
service. The existing GPT Sites files are retained for history; Netlify is now
the deployment target.

## Architecture

- Next.js App Router and strict TypeScript, deployed as one Netlify application.
- Supabase Free provides PostgreSQL and administrator authentication.
- Public submissions use a validated same-origin API route and a restricted
  database function.
- Public reads use an approved-reports view containing an explicit allowlist of
  non-personal columns.
- Private information is held in a non-exposed `private` schema.
- Admin API routes validate a Supabase session and administrator membership
  before calling privileged database functions.

## Pages

Public: home, report, reports, statistics, how it works, privacy, accessibility.

Private: admin login, dashboard, report list, report detail.

## Database

`public.incidents` stores structured incident facts. The private schema stores
reporter details, comments, admin notes and audit records. Public locations and
administrator profiles are separate public tables with strict RLS. A restricted
view publishes approved incident fields only.

## Public and private data

Every structured incident answer is public only after approval. Names, emails,
private comments, admin notes, audit metadata, internal IDs, and non-approved
reports are never returned by a public endpoint.

## Risks and mitigations

- Re-identification: broad locations, approximate times, no public free text.
- Spam: honeypot, size limits, validation, nonce-based duplicate protection,
  moderation; rate limiting is a documented future option.
- Privilege escalation: RLS, server-side session checks, admin profile check.
- Secret leakage: service-role key is not used by browser code; bundle scanning
  is included in the release checks.
- Volunteer error: confirmations, audit history and plain-language actions.

## Testing

Run formatting, linting, strict type checking, unit tests, Playwright axe checks,
security policy tests against a configured Supabase project, and a production
build. Manual cognitive-accessibility testing remains required before launch.

## Deployment

Netlify Free connected to a private GitHub repository. Required environment
variables are documented in `.env.example`. Apply the SQL migration, create the
first admin, set owner decisions, deploy, then complete live privacy and
accessibility verification.
