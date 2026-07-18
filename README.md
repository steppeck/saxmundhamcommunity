# Saxmundham Rail Disturbances Report

A community-led website for recording railway noise and related disturbance,
publishing approved non-personal reports, and showing recurring patterns. It is
not a council, Network Rail or emergency service.

## The three parts

1. **Public website:** anyone can submit a report and read approved facts.
2. **Private admin area:** authorised volunteers review reports and private data.
3. **Supabase:** securely stores reports, private details, accounts and history.

## Run it locally

1. Install Node.js 22 and pnpm 10.
2. Open a terminal in this folder.
3. Run `pnpm install`.
4. Copy `.env.example` to `.env.local`.
5. Add the four environment values described below.
6. Run `pnpm dev`.
7. Open `http://localhost:3000`.

## Create Supabase Free

1. Open `https://supabase.com/dashboard` and choose **New project**.
2. Stay on the Free plan. Choose a strong database password and store it safely.
3. Open **SQL Editor**, choose **New query**, paste
   `supabase/migrations/202607180001_initial_schema.sql`, then choose **Run**.
4. Open **Project Settings**, then **API**.
5. Copy **Project URL** to `NEXT_PUBLIC_SUPABASE_URL`.
6. Copy the public **anon** key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
7. Copy **service_role** to `SUPABASE_SERVICE_ROLE_KEY`. This value is secret:
   never paste it into public chat, GitHub, browser code or a `NEXT_PUBLIC_` value.
8. Create a random value of at least 32 characters for `SUBMISSION_SECRET`.

## Create the first administrator

1. In Supabase, open **Authentication**, then **Users**.
2. Choose **Add user**, then **Create new user**.
3. Enter the administrator email and a strong temporary password.
4. Copy the user ID shown for that account.
5. Open **SQL Editor** and run the following, replacing both example values:

```sql
insert into public.admin_profiles (user_id, display_name)
values ('PASTE-USER-ID-HERE', 'Administrator name');
```

6. Visit `/admin/login` and sign in. Each administrator must have their own account.

## Put the code on GitHub

1. Open `https://github.com/new`.
2. Create a private repository. Do not add a README, licence or `.gitignore`.
3. In this folder run `git init`, `git add .`, and check `git status`.
4. Confirm no `.env` file is listed.
5. Run `git commit -m "Build accessible rail disturbances platform"`.
6. Follow GitHub’s displayed commands to add the remote and push `main`.

## Deploy on Netlify Free

1. Open `https://app.netlify.com` and choose **Add new site** then
   **Import an existing project**.
2. Choose **GitHub**, authorise the private repository, and select it.
3. Netlify should read `netlify.toml`. Confirm build command `pnpm build`.
4. Open **Site configuration**, **Environment variables**, then **Add a variable**.
5. Add the four Supabase/submission variables from `.env.example`.
6. Also add `DATA_CONTROLLER_NAME`, `PRIVACY_CONTACT_EMAIL`, and the approved
   `CONTACT_RETENTION_DAYS`.
7. Choose **Deploy site**. Stay on the Free plan and do not enable paid add-ons.
8. Use the free `netlify.app` address for the pilot.

## Day-to-day administration

1. Visit `/admin/login`.
2. Open a pending report and read its structured and private answers.
3. Choose **Approve for public statistics**, **Duplicate**, **Excluded**, or
   **Removed**. Excluding or removing requires an internal reason.
4. Add a private note only when it is genuinely needed.
5. Confirm the decision. Approved structured facts then appear publicly.
6. Use the public reports page to download the public CSV.
7. Use **Delete name and email** to anonymise a reporter while keeping the
   structured incident record.

## Temporarily disable reporting

Remove `SUBMISSION_SECRET` in Netlify and redeploy. The report form remains
visible, but the server will reject submissions with a clear temporary-service
message. Add the secret back and redeploy to reopen submissions.

## Common problems

- **Reporting is temporarily unavailable:** add all environment variables and
  redeploy.
- **Administrator is not active:** add the user ID to `admin_profiles`.
- **No reports appear publicly:** new reports are pending; approve a fictional
  test report first.
- **Supabase says a function or view is missing:** rerun the migration and inspect
  the first SQL error.
- **Netlify build fails:** use Node 22, pnpm 10, and do not change the publish path.
- **A key was exposed:** rotate it in Supabase immediately, replace it in Netlify,
  and redeploy. Do not merely delete the visible message or commit.

## Quality checks

Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm test:accessibility`, and `pnpm build`. Live database security tests run
when the public Supabase values are present. Complete
`MANUAL_ACCESSIBILITY_CHECKLIST.md` before claiming full accessibility.

The provisional privacy choices and launch decisions are listed in
`PRE_LAUNCH_DECISIONS.md`. This repository intentionally has no software licence.
