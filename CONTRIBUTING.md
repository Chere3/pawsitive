# Contributing to Pawsitive

Thanks for helping improve Pawsitive 🐾

## Development setup
1. Install dependencies: `pnpm install`
2. Copy env files:
   - `cp apps/bot/.env.example apps/bot/.env`
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/dashboard/.env.example apps/dashboard/.env`
3. Build shared packages:
   - `pnpm --filter @pawsitive/config build`
   - `pnpm --filter @pawsitive/types build`
   - `pnpm --filter @pawsitive/shared build`
4. Start local stack: `pnpm dev`

## Branching & commits
- Branch format: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`, `refactor/<topic>`
- Conventional commits required (`feat:`, `fix:`, `chore:`, etc.)

## Pull request checklist
- [ ] Scope is focused and clearly described
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] README/docs updated if behavior changed
- [ ] Added notes for env/config changes

## Suggested first contributions
- Improve docs and setup experience
- Add health checks and better error handling
- Expand test coverage for command and API routes
