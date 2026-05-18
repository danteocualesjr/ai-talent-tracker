# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

AI Talent Tracker — a Next.js 15 (App Router) SaaS that monitors LinkedIn profiles at AI labs for job changes and sends alerts. Single `package.json`, no monorepo.

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | Main app — marketing + auth'd dashboard |
| Inngest dev server | `npx inngest-cli dev -u http://localhost:3000/api/inngest --no-discovery` | 8288 | Background jobs (cron, event-driven) |

Both services must run simultaneously for the full app to function. Start them in separate terminals/tmux panes.

### Lint / Typecheck / Build

```
npm run lint        # ESLint (next lint) — uses eslint.config.mjs
npm run typecheck   # tsc --noEmit
npm run build       # next build (production)
```

### Environment variables

Copy `.env.example` to `.env.local`. The app gracefully handles missing Supabase/Stripe/OpenAI credentials (falls back to safe defaults), so it starts without real secrets.

For full-featured dev, you need real Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Non-obvious caveats

- The ESLint config uses the flat-config format (`eslint.config.mjs`) with `@eslint/eslintrc` FlatCompat wrapper — required for Next.js 15 + ESLint 9.
- `npm run inngest` in `package.json` runs `inngest-cli dev` directly, but `inngest-cli` is not a listed dependency — use `npx inngest-cli dev` or install it globally.
- The Inngest dev server needs the `--no-discovery` flag in headless/CI environments to avoid interactive prompts.
- `PROFILE_PROVIDER=manual` (default in `.env.example`) lets you exercise the full diff/notification pipeline without Proxycurl API access.
- Database migrations are in `supabase/migrations/` and meant for the Supabase SQL editor or CLI — there is no local Supabase configuration (`supabase/config.toml` does not exist).
