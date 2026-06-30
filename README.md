# AI Talent Tracker

Real-time monitoring of LinkedIn (plus GitHub / X) profiles for employees at top AI labs. When a tracked profile changes company, headline, or location, we classify the change (left, joined, went stealth, founding signal, ...) and push an alert to email / Slack / webhook.

This repo is the full SaaS implementation: marketing pages, paywalled app, billing, schema, background jobs, classifier, and notifications.

---

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS** + shadcn-style UI primitives
- **Supabase** (Postgres + Auth, RLS-isolated multi-tenant)
- **Stripe** Checkout + Billing Portal
- **Inngest** for durable, retryable cron + event-driven jobs
- **Proxycurl** (or `manual` fallback) as the LinkedIn data provider, behind a `ProfileProvider` interface
- **OpenAI** `gpt-4o-mini` JSON-mode classifier for ambiguous changes
- **Resend** for transactional email; Slack incoming webhooks; HMAC-signed customer webhooks
- **PostHog** for product analytics (optional)
- **Vercel** for hosting

---

## Architecture

```
            ┌──────────────────────┐
            │   Next.js (Vercel)   │
            │  Marketing + App UI  │
            │  Server actions/API  │
            └──────────┬───────────┘
                       │
            ┌──────────▼───────────┐
            │   Supabase Postgres  │  ← RLS by org_id
            └──────────▲───────────┘
                       │
            ┌──────────┴───────────┐
            │   Inngest jobs       │  ← cron + event-driven
            └──────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Proxycurl     Diff + Classify   Notifications
                                  (Resend / Slack / Webhook)
```

The hot path: every hour the `schedule-refreshes` cron finds due profiles and emits `profile/refresh.requested` events. `refresh-profile` fetches the provider, stores a snapshot if the content hash is new, diffs the projected fields, runs the heuristic classifier, escalates to the LLM if ambiguous, persists an event, and emits `event/created`. `notify-event` fans out to every channel of every org watching that profile.

---

## Getting started

```bash
# 1. install
npm install

# 2. env
cp .env.example .env.local
# fill in Supabase, Stripe, Proxycurl, OpenAI, Resend, Inngest keys

# 3. database
# In Supabase SQL editor (or via supabase CLI):
#   - supabase/migrations/0001_init.sql
#   - supabase/migrations/0002_rls.sql
#   - supabase/migrations/0003_seed_labs.sql
#   - supabase/migrations/0004_github_activity.sql

# 4. dev
npm run dev            # next.js
npm run inngest        # inngest dev server (separate terminal)

# 5. (optional) seed a roster
npm run seed
```

### Stripe setup

1. Create two recurring prices in Stripe Dashboard: `Pro` ($49/mo) and `Team` ($299/mo).
2. Set `STRIPE_PRICE_PRO` and `STRIPE_PRICE_TEAM` in env.
3. Configure a webhook in Stripe pointing to `POST /api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Store the signing secret in `STRIPE_WEBHOOK_SECRET`.

### Data provider

Set `PROFILE_PROVIDER=proxycurl` and `PROXYCURL_API_KEY=...` for live data. Without these the app falls back to the `manual` provider, which still lets you add profiles, run diffs, and exercise the full notification path during development.

To swap to Coresignal or another provider, implement the `ProfileProvider` interface in [`src/lib/providers/types.ts`](src/lib/providers/types.ts) and register it in [`src/lib/providers/index.ts`](src/lib/providers/index.ts).

### Inngest

In production, deploy the `/api/inngest` route and connect it in the Inngest dashboard. In dev, run `npx inngest-cli@latest dev` and point it at `http://localhost:3000/api/inngest`.

---

## Routes

Public:
- `/` — landing
- `/feed` — public departure feed (+ `/feed/[id]`, `/feed/rss.xml`)
- `/labs`, `/labs/[slug]` — programmatic SEO lab pages
- `/pricing`, `/privacy`, `/opt-out`
- `/login`, `/auth/callback`

App (auth required):
- `/app` — dashboard
- `/app/watchlist` — add / remove / refresh profiles
- `/app/events` — full event feed
- `/app/labs`, `/app/labs/[slug]` — internal lab views
- `/app/profiles/[id]` — profile detail + snapshot history
- `/app/alerts` — manage email / Slack / webhook channels
- `/app/billing`, `/app/settings`

APIs:
- `/api/inngest` — Inngest webhook handler
- `/api/stripe/webhook` — Stripe events
- `/api/checkout`, `/api/portal` — start checkout / billing portal
- `/api/opt-out` — DSAR / removal request

---

## Compliance notes

We do **not** scrape LinkedIn directly. We rely on licensed third-party data providers and combine that with public signals (GitHub, X, WHOIS). Privacy policy + DSAR flow are wired (`/privacy`, `/opt-out`, `is_opted_out` on `profiles`). Profile snapshots are deleted on verified opt-out.

---

## Roadmap

Built (MVP):
- Schema, RLS, Stripe billing, Supabase auth, Inngest cron + event-driven jobs
- Proxycurl/manual provider abstraction, diff engine, rule + LLM classifier
- Email / Slack / webhook delivery
- Marketing site, public feed (+ RSS), lab pages, paywalled app
- GitHub commit activity signal (`github_dark` event when activity drops off)

Next:
- X bio change + new-domain WHOIS signal
- Multi-user team accounts (invites)
- API access tier
- ATS/CRM integrations (Greenhouse, HubSpot)
- CSV roster import
