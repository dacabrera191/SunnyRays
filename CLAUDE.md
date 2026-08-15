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
- `/instructors`, `/contact`, `/schedule` (renders `components/calendar.jsx`), `/signup` — a 2-step multi-part form (parent info → kids) that posts to `/api/signup`
- `app/api/signup/route.jsx` — signup endpoint
- `app/api/comments/route.jsx` — comments endpoint

**Note:** `components/navbar.jsx` links to `/login`, but only an `/signup` route exists — there is no `/login` page yet.

### Two database clients, used for different things
- **Supabase** (`@supabase/supabase-js`) — used in `app/api/signup/route.jsx` for the `parents`/`kids` tables. Client is created with `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (service role, server-only — never expose to the client bundle). Passwords are hashed with `bcrypt` (cost 12) before insert; the column is `password_hash`, not `password`. Postgres error code `23505` on the `parents` insert is treated as a duplicate-email conflict (409).
- **Neon** (`@neondatabase/serverless`) — used in `app/api/comments/route.jsx` via tagged-template SQL against `DATABASE_URL`, for the `comments` table.

Both are configured through env vars that must be present locally (`.env.local`, gitignored) — there's no `.env.example` checked in.

### Styling
Two systems coexist:
- **CSS custom properties in `app/theme.css`** define the brand palette and semantic tokens (`--color-primary`, `--color-bg`, `--color-text`, etc.), including a `[data-theme="dark"]` override block.
- **Tailwind (`tailwind.config.js`)** maps those same CSS variables into Tailwind color/background utilities (e.g. `bg-primary`, `text-ink-muted`, `bg-page`), so semantic tokens are used identically whether writing Tailwind classes or raw CSS. Prefer the semantic names (`primary`, `ink`, `surface`, `accent`, ...) over the raw brand names (`sky`, `ocean`, `navy`, ...) to stay theme/dark-mode-consistent.
- `components/calendar.jsx` uses a `<style>` block with its own scoped class names (`.cal-*`) instead of Tailwind, still referencing the same `var(--color-*)` tokens.
- `app/signup/page.jsx` uses CSS Modules (`page.module.css`) instead of Tailwind.

There's no single convention enforced — match whatever the file you're editing already uses.
