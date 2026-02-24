# Development Guide

## Prerequisites
- Node.js 18+
- Bun 1.x
- pnpm 9+

## Install
```bash
pnpm install
```

## Run locally
```bash
pnpm dev
```

Run individual services:
```bash
pnpm bot:dev
pnpm api:dev
pnpm dashboard:dev
```

## Quality checks
```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Database / migrations
```bash
pnpm db:migrate
```

## Contribution flow
1. Branch from `main`.
2. Keep PRs scoped per domain (`bot`, `api`, `dashboard`, `packages/*`).
3. Run quality checks before pushing.
4. Include verification steps and risk notes in PR description.
