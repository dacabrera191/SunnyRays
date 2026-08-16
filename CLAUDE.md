# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm run start` — run the production build

There is no lint, test, or typecheck script configured in `package.json` — don't assume one exists.

## Architecture

Next.js 14 App Router site for Sunny Rays Swim School (`instructor-site`), using plain JS/JSX (not TypeScript — `tsconfig.json` exists only for editor tooling via `allowJs`/`checkJs` off, `strict: false`).

### Routes (`app/`)
- `/` — instructor bio landing page
- `/instructors`, `/contact`, `/schedule` (renders `components/calendar.jsx`) — informational pages
- `/signup` — a 2-step multi-part form (parent info → kids) that posts to `/api/signup`
- `/login` — posts to `/api/login`; on success does a client-side `router.push("/dashboard")`
- `/dashboard` — placeholder page ("Lesson scheduling tools will live here"); it is a plain unprotected page component, and `/api/login` doesn't set a session cookie/JWT (the route comment says as much) — there is no auth/session layer yet, so anyone can navigate to `/dashboard` directly
- `app/api/signup/route.jsx` — creates a `parents` row (bcrypt-hashed `password_hash`, cost 12) and its `kids` rows; Postgres `23505` on the `parents` insert means duplicate email → 409
- `app/api/login/route.jsx` — looks up `parents` by lowercased email, bcrypt-compares `password_hash`; runs a dummy `bcrypt.compare` on unknown emails to keep response timing uniform
- `app/api/comments/route.jsx` — list/create rows in `comments`

### Database: Neon only
All three API routes use `@neondatabase/serverless` (`neon()` tagged-template SQL) against `DATABASE_URL`. `@supabase/supabase-js` is still in `package.json`/`package-lock.json` but is not imported anywhere in the code — don't assume a Supabase client exists or wire new code to it without checking first.

Env vars must be present locally (`.env.local`, gitignored) — there's no `.env.example` checked in.

### Styling
Two systems coexist:
- **CSS custom properties in `app/theme.css`** define the brand palette and semantic tokens (`--color-primary`, `--color-bg`, `--color-text`, etc.), including a `[data-theme="dark"]` override block.
- **Tailwind (`tailwind.config.js`)** maps those same CSS variables into Tailwind color/background utilities (e.g. `bg-primary`, `text-ink-muted`, `bg-page`), so semantic tokens are used identically whether writing Tailwind classes or raw CSS. Prefer the semantic names (`primary`, `ink`, `surface`, `accent`, ...) over the raw brand names (`sky`, `ocean`, `navy`, ...) to stay theme/dark-mode-consistent.
- `components/calendar.jsx` uses a `<style>` block with its own scoped class names (`.cal-*`) instead of Tailwind, still referencing the same `var(--color-*)` tokens.
- `app/signup/page.jsx` and `app/login/page.jsx` use CSS Modules (`page.module.css`) instead of Tailwind.

There's no single convention enforced — match whatever the file you're editing already uses.
