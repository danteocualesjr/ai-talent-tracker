# AGENTS.md

## Cursor Cloud specific instructions

### Overview

AI Talent Tracker is a Next.js 15 (App Router) + React 19 SaaS app that monitors AI lab employee profiles. The core stack is TypeScript, Tailwind CSS, Supabase (Postgres + Auth), Stripe billing, and Inngest background jobs.

### Services

| Service | How to start | Port |
|---------|-------------|------|
| Next.js dev server | `npm run dev` | 3000 |
| Inngest dev server | `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` | 8288 |
| Supabase (local) | `supabase start` (requires Docker) | 54321 (API), 54322 (DB), 54323 (Studio) |

### Commands (see `package.json` scripts)

- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Seed labs**: `npm run seed`

### Non-obvious notes

- **Docker must be running before Supabase**: `supabase start` requires Docker. In the Cloud Agent VM, Docker needs `sudo dockerd` with `fuse-overlayfs` storage driver and `iptables-legacy`. The daemon.json at `/etc/docker/daemon.json` should have `{"storage-driver": "fuse-overlayfs"}`.
- **Socket permissions**: After starting dockerd, run `sudo chmod 666 /var/run/docker.sock` so the non-root user can connect.
- **Supabase auto-applies migrations**: `supabase start` automatically runs all SQL files in `supabase/migrations/` — no separate migration step is needed.
- **`.env.local` for local dev**: Copy `.env.example` to `.env.local`. For local Supabase, use the keys from `supabase status -o json` (fields `ANON_KEY`, `SERVICE_ROLE_KEY`, `API_URL`).
- **Stripe placeholders work for dev**: The app gracefully handles invalid Stripe keys for non-billing pages. Billing features require real test-mode keys.
- **`PROFILE_PROVIDER=manual`**: The manual provider is a no-op stub that lets you exercise the full notification pipeline without needing Proxycurl API access.
- **ESLint config**: On first run, `next lint` prompts interactively. The `.eslintrc.json` with `"extends": "next/core-web-vitals"` is already committed.
- **Inngest functions**: The 3 registered functions (`schedule-refreshes`, `refresh-profile`, `notify-event`) are auto-discovered by the Inngest dev server from `/api/inngest`.
