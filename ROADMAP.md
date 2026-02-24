# ROADMAP

## Quick wins
- Add top-level roadmap and contributor development guide.
- Add CI workflow for install, typecheck, and lint across workspaces.
- Replace machine-specific setup examples with repository-generic commands.
- Add `.env.example` matrix documentation across apps.

## Medium bets
- Add test strategy baseline (unit tests in shared packages + integration tests for API).
- Add release/versioning strategy for workspace packages.
- Add pre-commit quality hooks (format + lint + typecheck changed scopes).
- Define observability standards (logging correlation ids, request metrics, error taxonomy).

## Big bets
- Implement image processing pipeline (queue + worker + retries + storage backends).
- Add production auth flow for dashboard and secured API routes.
- Add feature flags and rollout strategy for Discord capabilities.
- Implement end-to-end deploy topology (bot, API, dashboard) with IaC.

## Strategic rewrites
- Formalize domain boundaries between bot, API, and dashboard with contract-first schemas.
- Introduce event-driven architecture for bot ↔ API async workloads.
- Extract plugin system for media providers and moderation pipelines.
- Build a shared domain package with explicit anti-corruption layers.
