# Database migrations

Plain numbered SQL files, applied manually against the Neon database (the
same one provisioned through the Vercel↔Neon integration and read via
`DATABASE_URL` in `lib/db.ts`). There's no bundled migration runner — the
Neon HTTP driver has no multi-statement transactions, and no ORM is used.

Apply a migration with either:

```sh
psql "$DATABASE_URL" -f db/migrations/000N_description.sql
```

or paste the file's contents into the Neon SQL Editor (also reachable from
the Vercel project's Storage tab).

Run files in numeric order. Each file is a one-way forward migration; there
are no down-migrations.

## Applied migrations

- `0001_add_role_to_parents.sql` — adds `parents.role` (`client` | `instructor` | `admin`, default `client`) for Phase 2 auth/roles.
