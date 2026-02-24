# @pawsitive/db

Database foundation package for Pawsitive.

## Current stack
- Bun SQLite (`bun:sqlite`)
- SQL migrations defined in `src/schema.ts`

## Commands
- `bun run db:migrate` — applies bootstrap schema

From repo root:
- `bun run db:migrate`

## Default database file
`./data/pawsitive.db` (override with `DATABASE_URL`)

## Initial tables
- `users`
- `sessions`
- `guild_configs`
