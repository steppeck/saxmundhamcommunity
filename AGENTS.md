# Project rules

- Use British English and calm, neutral community language.
- Meet WCAG 2.2 AA; preserve keyboard use, visible focus and 200% zoom.
- Reporting pages use at least 18px base text and one main question group per step.
- Never publish names, emails, comments, notes, audit data or internal IDs.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or commit `.env` files.
- Public data must come only from the approved public view or aggregate functions.
- New reports are pending. Publication always requires an administrator.
- Use `pnpm`; install with `pnpm install`, run locally with `pnpm dev`.
- Required checks: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
  `pnpm test:accessibility`, and `pnpm build`.
- Do not add paid services, AI features, media uploads, tracking or IP storage.
- Keep configurable wording and choices in `config/site.ts`.
- Do not add a software licence.
