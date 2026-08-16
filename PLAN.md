# SunnyRays Implementation Plan — TypeScript, Roles/Auth, Scheduling, Apple Pay

## Context

SunnyRays (`instructor-site`) is currently a Next.js 14 App Router site for a single instructor: static marketing pages, a parent/kid signup flow, a login route that never actually establishes a session, and a `/schedule` page that renders a fully local, non-persisted calendar demo. The goal is to grow this into a real multi-instructor swim school platform:

- Written in TypeScript instead of plain JS/JSX.
- Three account roles — **client** (parent), **instructor**, **admin** — with real authentication and role-based access.
- Instructors author their own availability; clients browse it and **request** lesson dates (instructor/admin approves — not instant self-booking).
- In-app payment via **Apple Pay**, built on **Stripe** (chosen because Stripe's Payment Request Button surfaces Apple Pay with minimal setup and handles PCI compliance).

This is a large scope, so it's delivered as **four sequential, independently reviewable/mergeable phases**, in order. Each phase is designed not to break what already works.

### Decisions already made
| Decision | Choice |
|---|---|
| Language | Convert to TypeScript |
| Roles | `client`, `instructor`, `admin` |
| Booking model | Request-then-approve (client requests a slot; instructor/admin approval is what actually locks it) |
| Payment processor | Stripe (Payment Request Button → Apple Pay) |
| Payment timing | After instructor approval, not at request time (avoids refunding denied requests) |
| Pricing | Per-slot, set by the instructor (no flat site-wide rate) |
| Rollout | Phased, four sequential stages |
| Auth mechanism | Custom JWT + httpOnly cookie (not NextAuth/Auth.js) — lightweight, matches existing minimal-dependency style |
| Role provisioning | Admin-created only — public `/signup` always creates a `client` account; instructor/admin accounts are created by an admin |

---

## Current State (verified from the codebase)

**Stack**: Next.js 14.2.3 App Router, plain JS/JSX (not TS), React 18, Tailwind 3.4 + CSS custom properties (`app/theme.css`, mirrored into `tailwind.config.js`), CSS Modules on `/signup`/`/login`, a scoped `<style>` block in `components/calendar.jsx`. `tsconfig.json` exists but is editor-only (`allowJs: true`, `strict: false`).

**Routes**:
- `/`, `/instructors` — static
- `/contact` — GET/POST `/api/comments`
- `/signup` — 2-step wizard → `POST /api/signup`
- `/login` — `POST /api/login`, then `router.push("/dashboard")` — **no cookie/session is set today**
- `/dashboard` — static stub, **zero auth guard**, publicly reachable by anyone
- `/schedule` — renders `<Calendar/>` with zero props, zero persistence

**API routes** (`@neondatabase/serverless`, each instantiates its own `neon()` client — no shared `lib/db.js`):
- `app/api/signup/route.jsx` — bcrypt-hashes password (cost 12), inserts `parents` + loops inserting `kids`, manual delete-on-failure "rollback"
- `app/api/login/route.jsx` — bcrypt-compares, dummy-compares on unknown email for timing safety, returns parent info — **explicitly comments that no session/JWT is issued**
- `app/api/comments/route.jsx` — GET/POST on `comments`

**Inferred DB schema** (no migration files exist anywhere in the repo — schema is only inferable from the queries):
- `parents`: id, name, email (unique), phone, address, password_hash
- `kids`: parent_id (FK), name, age, swim_level
- `comments`: id, comment, created_at
- No `instructors`, `schedules`, `bookings`, `roles`, or `payments` tables exist yet.

**Auth**: no session/cookie/JWT layer, no `middleware.js`, no route protection at all.

**Payments**: no existing code, packages, or env scaffolding — greenfield.

**package.json**: `@supabase/supabase-js` is installed but unused anywhere in the code — dead weight.

---

## Phase 1 — TypeScript Conversion (No Functional Changes)

Convert every `.js`/`.jsx` file to `.ts`/`.tsx` with real types. Zero behavior change.

### Config
- `tsconfig.json`: flip `strict: true` as the *last* step once everything compiles clean; drop `allowJs` and the `.js`/`.jsx` include globs once no such files remain.
- `package.json`: remove `@supabase/supabase-js` (confirmed unused); add `"typecheck": "tsc --noEmit"`; fix `@types/react`/add `@types/react-dom` to match the installed React 18 (currently `@types/react` is pinned to a React 19 line — a latent mismatch).

### Files
- **New** `lib/db.ts` — extracts the repeated `neon(process.env.DATABASE_URL)` pattern into one shared, typed export.
- `app/api/{signup,login,comments}/route.jsx` → `.ts`, typed payloads/rows, import `sql` from `lib/db.ts`.
- `components/calendar.jsx` → `.tsx` — typing only, **no new props yet** (that's Phase 3).
- `components/navbar.jsx`, `app/layout.jsx`, `app/page.jsx`, `app/instructors/page.jsx`, `app/contact/page.jsx`, `app/signup/page.jsx`, `app/login/page.jsx`, `app/dashboard/page.jsx`, `app/schedule/page.js` → straight `.tsx` renames with typed state/props.
- **New** `types/` directory for payload shapes shared between a page and the API route it calls.

### Why this is safe
Every change is rename + type annotation, or a pure refactor (hoisting `neon()` into one file — all three routes call it identically today). No schema changes, no new env vars. Run `npm run build` after each file to catch issues early; flip `strict: true` only once everything is converted and green.

**Critical files**: `lib/db.ts`, `app/api/login/route.ts`, `app/api/signup/route.ts`, `components/calendar.tsx`, `tsconfig.json`

---

## Phase 2 — Auth/Session Layer + Roles

### Library choice: `jose`, not `jsonwebtoken`
`jsonwebtoken` depends on Node's `crypto` in a way that isn't compatible with the Edge Runtime that `middleware.ts` runs on by default. `jose` is Web Crypto-based and works in both Node API routes and Edge middleware, with zero sub-dependencies.

### DB schema
`db/migrations/0001_add_roles_and_sessions.sql`:
```sql
ALTER TABLE parents ADD COLUMN role TEXT NOT NULL DEFAULT 'client'
  CHECK (role IN ('client', 'instructor', 'admin'));
```
No new `users` table — `parents` already has everything an authenticated account needs (id, name, email, phone, password_hash); instructors/admins are just rows with no `kids`. Renaming `parents` → `accounts` would touch every existing route and `kids.parent_id` for no functional gain — accepted as naming debt, not fixed now.

### New/modified files
- **New** `lib/auth.ts` — `signSession()`/`verifySession()` via `jose`, HS256, `JWT_SECRET` env var, `SESSION_COOKIE_NAME = 'sr_session'`.
- **New** `middleware.ts` (repo root) — reads/verifies the session cookie; redirects to `/login` (pages) or `401`s (APIs) if missing/invalid; role-gates `/admin/*` and `/api/admin/*`. Matcher scoped to protected prefixes only — public routes are untouched.
- `app/api/login/route.ts` — on successful bcrypt compare, signs a JWT (`sub`, `email`, `role`) and sets it as an **httpOnly, secure-in-prod, sameSite=lax** cookie. Response body additively gains `role` (nothing today reads beyond the `ok` flag, so this is non-breaking).
- **New** `app/api/auth/logout/route.ts` — clears the cookie.
- **New** `app/api/auth/me/route.ts` — server-verifies the cookie, returns `{ authenticated, user }`. Since the cookie is httpOnly, client components (e.g. the navbar) **must** go through this endpoint to know who's logged in — they cannot read the cookie directly.
- `app/api/signup/route.ts` — unchanged INSERT (relies on the new column's `DEFAULT 'client'`); optionally made explicit for clarity.
- **New** `app/api/admin/staff/route.ts` — admin-only `POST` to provision instructor/admin accounts (rejects `role: 'client'` — that stays exclusively on public `/signup`).
- **New** `app/admin/page.tsx` + `app/admin/staff/page.tsx` — minimal admin UI to call the staff-provisioning API.
- **New** `scripts/seed-admin.ts` — one-time seed script (reads `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`/`ADMIN_SEED_NAME`) to bootstrap the very first admin account, since admin-created-only provisioning is otherwise circular on a fresh database. Run via `npm run seed:admin` (needs `tsx` as a devDependency).
- `components/navbar.tsx` — fetches `/api/auth/me` to conditionally render logged-out vs. role-aware nav links.
- `app/dashboard/page.tsx` — becomes genuinely protected (closes the current "public stub" gap); greets the user by name/role via server-side cookie read.

**Critical files**: `middleware.ts`, `lib/auth.ts`, `app/api/login/route.ts`, `db/migrations/0001_add_roles_and_sessions.sql`, `scripts/seed-admin.ts`

---

## Phase 3 — Instructor Scheduling + Client Booking/Request Flow

Request-then-approve: a slot only becomes truly unavailable once an instructor **approves** a request, not when a client requests it (so the UI must distinguish "requested/pending" from "booked/approved").

### DB schema
`db/migrations/0002_scheduling_and_bookings.sql`:
```sql
CREATE TABLE availability_slots (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_hour INTEGER NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'booked', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instructor_id, slot_date, start_hour)
);

CREATE TABLE booking_requests (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  kid_id INTEGER NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  decided_by INTEGER REFERENCES parents(id),
  notes TEXT
);

CREATE INDEX idx_booking_requests_slot ON booking_requests(slot_id);
CREATE INDEX idx_booking_requests_parent ON booking_requests(parent_id);
CREATE INDEX idx_availability_instructor_date ON availability_slots(instructor_id, slot_date);
```
`price_cents` lives on the slot and is set by the instructor when they create it. `availability_slots.status` flips to `'booked'` only on approval; approving one pending request for a slot should auto-deny any other pending requests for the same slot in the same operation (Neon's HTTP driver doesn't support multi-statement transactions — follow the existing codebase's "manual rollback" pattern of sequential awaited statements with explicit compensating logic on failure).

### New/modified files
- **Instructor**: `app/instructor/page.tsx`, `app/instructor/availability/page.tsx` (author availability), `app/instructor/requests/page.tsx` (approve/deny); `app/api/instructor/availability/route.ts`, `app/api/instructor/requests/route.ts`, `app/api/instructor/requests/[id]/decision/route.ts`. All queries scope by `instructor_id = session.sub` server-side, never trusting client-supplied ids.
- **Client**: `app/schedule/page.tsx` (modify) — fetches open slots, renders `<Calendar mode="client-request" .../>`; **new** `app/api/booking-requests/route.ts` (`POST` to request, `GET` for "my requests"); `app/dashboard/page.tsx` (modify further) — shows the client's kids' pending/approved bookings.
- **Admin**: `app/admin/instructors/page.tsx` — same views as instructor pages, scoped to "all instructors."

### Calendar refactor (key architectural decision)
`components/calendar.tsx` becomes one shared shell with a `mode` prop instead of three separate components:
```ts
type CalendarMode = "instructor-author" | "client-request" | "read-only";
interface CalendarProps {
  mode: CalendarMode;
  slots?: AvailabilitySlot[];
  onCreateSlot?: (date: string, hour: number) => void;
  onRequestSlot?: (slotId: number) => void;
  loading?: boolean;
}
```
Month-navigation state (`viewDate`) stays local in all modes; only the *data* (`bookedSlots` → `slots` prop) and *interaction callback* change per mode. The existing month-grid rendering and `<style>` block are unchanged — this makes Phase 1's typing-only conversion of this file non-wasted work.

Today's `/schedule` renders `<Calendar/>` with zero data and ephemeral local state (lost on refresh already), so wiring it to real fetched `slots` is a pure upgrade, not a breaking change.

**Critical files**: `components/calendar.tsx`, `db/migrations/0002_scheduling_and_bookings.sql`, `app/api/instructor/requests/[id]/decision/route.ts`, `app/api/booking-requests/route.ts`, `app/schedule/page.tsx`

---

## Phase 4 — Stripe + Apple Pay Checkout

Payment happens **after** instructor approval, not at request time — avoids refunding denied requests and matches the request/approval framing cleanly. (A payment-deadline/slot-reopen job for unpaid-approved bookings is a nice-to-have for later, not required for initial delivery.)

### DB schema
`db/migrations/0003_payments.sql`:
```sql
ALTER TABLE booking_requests
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'processing', 'paid', 'failed', 'refunded')),
  ADD COLUMN stripe_payment_intent_id TEXT;

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_request_id INTEGER NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### New/modified files
- **New** `lib/stripe.ts` — server-side Stripe client.
- **New** `app/api/payments/create-intent/route.ts` — `POST { bookingRequestId }`, validates it's the caller's own **approved, unpaid** booking, creates a Stripe PaymentIntent using the slot's `price_cents`, returns `clientSecret`.
- **New** `app/api/payments/webhook/route.ts` — verifies Stripe signature (`STRIPE_WEBHOOK_SECRET`), updates `payments`/`booking_requests.payment_status` on `payment_intent.succeeded`/`payment_intent.payment_failed`. **This is the source of truth for "paid," not the client-side callback** (client can close the tab mid-payment). Needs the raw request body (`req.text()`) before any JSON parsing, for signature verification.
- **New** `app/dashboard/pay/[bookingRequestId]/page.tsx` — renders Stripe's `PaymentRequestButtonElement` (`@stripe/react-stripe-js` + `@stripe/stripe-js`), which auto-detects and surfaces Apple Pay on supported Safari/iOS devices.
- `app/instructor/requests/page.tsx` — approved-but-unpaid requests show a "payment pending" badge rather than being treated as fully confirmed.

### Apple Pay — non-code prerequisites (cannot be automated by this plan)
1. An Apple Developer account with a registered **Merchant ID**.
2. A domain association file hosted at `public/.well-known/apple-developer-merchantid-domain-association` (Next.js serves `public/` at the root) — the file's *contents* come from Apple/Stripe's dashboard, not from this repo.
3. Domain verification in the **Stripe Dashboard** (Settings → Payment methods → Apple Pay → Add a new domain), which depends on step 2 being live.
4. Production **HTTPS** is a hard requirement for Apple Pay to activate.

None of this is code — it needs your Apple Developer and Stripe Dashboard access. Worth starting in parallel with Phase 3 (no code dependency) so it isn't a blocker sitting in front of Phase 4.

**Critical files**: `lib/stripe.ts`, `app/api/payments/create-intent/route.ts`, `app/api/payments/webhook/route.ts`, `db/migrations/0003_payments.sql`, `public/.well-known/apple-developer-merchantid-domain-association`

---

## Cross-Cutting Concerns

### Migrations
No migration tooling exists today (Neon's HTTP driver has no bundled runner; no ORM is used). Introduce plain numbered SQL files under `db/migrations/`, applied manually (`psql "$DATABASE_URL" -f db/migrations/000N_....sql` or the Neon SQL Editor), documented in a `db/migrations/README.md`. Revisit a real migration tool only if schema velocity increases significantly beyond Phase 4 — not needed for 3 total migrations.

### Styling for new UI
Three styling systems already coexist by convention (match whatever the file you're editing already uses, per `CLAUDE.md`). For **new** instructor/admin pages (no prior convention to match), default to Tailwind semantic tokens (`bg-primary`, `text-ink`, `bg-surface`, ...) — lowest friction for building several similar dashboard layouts. Extend `components/calendar.tsx`'s existing scoped `<style>` block for new slot-state styling rather than mixing Tailwind into that file. Reserve CSS Modules for form-heavy pages matching the existing `/signup`/`/login` pattern.

### Shared UI components
Extract incrementally, not upfront: `components/ui/Button.tsx` in Phase 2 (admin/instructor forms need it immediately), `components/ui/Card.tsx` and `components/ui/Badge.tsx` in Phase 3 (dashboards, status pills). Don't extract a form-input primitive — existing forms are small enough that matching the existing plain `<label>` markup directly is simpler than an abstraction.

### Environment variables per phase
- Phase 1: none new.
- Phase 2: `JWT_SECRET`; `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`/`ADMIN_SEED_NAME` (only needed where the seed script runs, not at app runtime).
- Phase 3: none new.
- Phase 4: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (must have the `NEXT_PUBLIC_` prefix to reach the client bundle — the secret key must never get that prefix), `STRIPE_WEBHOOK_SECRET`.

No `.env.example` exists today — worth adding starting in Phase 2, since required vars grow from 1 to 6+.

### Testing/CI
No test framework or CI exists today; this plan doesn't mandate adding one, but keep `npm run typecheck` (added in Phase 1) as a cheap manual pre-merge check for every later phase's PRs.

---

## Overall Critical Files
- `lib/db.ts` — shared Neon client (Phase 1), used by every later API route
- `lib/auth.ts` — JWT sign/verify core (Phase 2), used by `middleware.ts` and every protected route in Phases 2–4
- `middleware.ts` — role-based route protection (Phase 2), matcher grows in Phases 3–4
- `components/calendar.tsx` — mode-based refactor (Phase 3), reused across client/instructor/admin views
- `db/migrations/*.sql` — the entire schema evolution (roles → scheduling/booking → payments), the only source of truth for schema in this repo
