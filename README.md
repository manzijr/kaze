# Kaze

Zillow-style property listing platform for Rwanda.

## Structure

- `apps/web` — Next.js public site + agent/owner dashboard
- `apps/mobile` — Expo (React Native) app for buyers/renters
- `packages/shared` — shared TypeScript types and Supabase client
- `supabase/` — SQL migrations and seed data (Rwanda location taxonomy)

## Getting started

```bash
pnpm install
pnpm dev:web      # Next.js dev server
pnpm dev:mobile   # Expo dev server
```

Copy `apps/web/.env.local.example` to `.env.local` (and the mobile equivalent) and fill in your Supabase project URL/anon key.

See `/Users/junior/.claude/plans/mellow-snuggling-petal.md` for the full build plan and roadmap.
