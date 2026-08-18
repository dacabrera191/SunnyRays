# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment constraints

This container has restricted egress through a Squid proxy. Reachable hosts:
- github.com, api.github.com, codeload.github.com
- api.anthropic.com

Everything else is blocked at the proxy, including pypi.org,
files.pythonhosted.org, registry.npmjs.org, and the Ubuntu apt mirrors.

Implications:
- Do NOT attempt `pip install`, `npm install`, `apt-get install`,
  `cargo add`, `go get`, or any other package fetch. They will fail.
- Do NOT try to work around it with curl/wget to a mirror, a different
  index URL, or an alternate proxy.
- If a task requires a dependency that isn't already installed, stop and
  tell me which package you need. I'll add it to the image or the allowlist.
- Preinstalled tooling is in <path>. Check there before assuming something
  is missing.

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run typecheck` — `tsc --noEmit`

There is no lint or test script configured in `package.json` — don't assume one exists.

## Architecture

Next.js 14 App Router site for Sunny Rays Swim School (`instructor-site`), written in TypeScript (`tsconfig.json` has `strict: true`; every source file is `.ts`/`.tsx`, no `.js`/`.jsx` remain).

Request/response payload shapes shared between a page and the API route it calls live in `types/` (e.g. `types/auth.ts` has `LoginPayload`, `SignupPayload`, `KidPayload`; `types/comment.ts` has `Comment`). When adding a new API route with a client caller, add its payload/row types there rather than inlining them.

### Routes (`app/`)
- `/` — instructor bio landing page
- `/instructors`, `/contact`, `/schedule` (renders `components/calendar.tsx`) — informational pages
- `/signup` — a 2-step multi-part form (parent info → kids) that posts to `/api/signup`
- `/login` — posts to `/api/login`; on success does a client-side `router.push("/dashboard")`
- `/dashboard` — placeholder page ("Lesson scheduling tools will live here"); it is a plain unprotected page component, and `/api/login` doesn't set a session cookie/JWT (the route comment says as much) — there is no auth/session layer yet, so anyone can navigate to `/dashboard` directly
- `app/api/signup/route.ts` — creates a `parents` row (bcrypt-hashed `password_hash`, cost 12) and its `kids` rows; Postgres `23505` on the `parents` insert means duplicate email → 409; if the kid inserts fail partway through, it manually deletes the just-created `parents` row as a rollback (no multi-statement transactions — see Database note below)
- `app/api/login/route.ts` — looks up `parents` by lowercased email, bcrypt-compares `password_hash`; runs a dummy `bcrypt.compare` on unknown emails to keep response timing uniform
- `app/api/comments/route.ts` — list/create rows in `comments`

### Database: Neon only
All three API routes import the shared `sql` tagged-template client from `lib/db.ts` (`neon(process.env.DATABASE_URL)`) — don't re-instantiate `neon()` per route. `@supabase/supabase-js` was removed from `package.json`; there is no Supabase client anywhere in the code.

The Neon HTTP driver has no multi-statement transactions, so multi-step writes (e.g. signup's parent+kids insert) use sequential awaited statements with manual compensating logic on failure rather than `BEGIN`/`COMMIT`.

No migration files exist in the repo — the schema (`parents`, `kids`, `comments`) is only inferable from the queries in the API routes.

Env vars must be present locally (`.env.local`, gitignored) — there's no `.env.example` checked in.

### Styling
Two systems coexist:
- **CSS custom properties in `app/theme.css`** define the brand palette and semantic tokens (`--color-primary`, `--color-bg`, `--color-text`, etc.), including a `[data-theme="dark"]` override block.
- **Tailwind (`tailwind.config.js`)** maps those same CSS variables into Tailwind color/background utilities (e.g. `bg-primary`, `text-ink-muted`, `bg-page`), so semantic tokens are used identically whether writing Tailwind classes or raw CSS. Prefer the semantic names (`primary`, `ink`, `surface`, `accent`, ...) over the raw brand names (`sky`, `ocean`, `navy`, ...) to stay theme/dark-mode-consistent.
- `components/calendar.tsx` uses a `<style>` block with its own scoped class names (`.cal-*`) instead of Tailwind, still referencing the same `var(--color-*)` tokens.
- `app/signup/page.tsx` and `app/login/page.tsx` use CSS Modules (`page.module.css`) instead of Tailwind.

There's no single convention enforced — match whatever the file you're editing already uses.

## Roadmap

`PLAN.md` at the repo root is a four-phase plan (TypeScript conversion → auth/roles → instructor scheduling/booking → Stripe/Apple Pay checkout) with concrete schema, file, and library decisions for each phase. Phase 1 (TypeScript conversion) is done. Check it before starting auth, scheduling, or payments work — those phases have already-made decisions (e.g. `jose` over `jsonwebtoken` for Edge-compatible JWTs, request-then-approve booking, Stripe Payment Request Button for Apple Pay) that should be followed rather than re-derived.
