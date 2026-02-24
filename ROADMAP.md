# ROADMAP

## Quick wins (1-2 weeks)
- Add contributor onboarding checklist with first-task flow.
- Add CI workflow for lint + typecheck + build on pull requests.
- Add `.env.example` validation script to detect missing required variables before runtime.
- Document local service matrix (ports, commands, dependencies) in one place.

## Medium (2-6 weeks)
- Implement authenticated API endpoints for dashboard/admin actions.
- Add integration tests for bot ↔ API webhook flow.
- Add observability baseline (structured logs + request IDs + health metrics).
- Introduce persistent storage for guild configuration and user preferences.

## Big bets (1-3 months)
- Production-ready image processing pipeline (queue + retries + storage backend).
- Real-time dashboard updates (WebSocket/SSE) for bot status and job progress.
- Permissioned command management UI for server admins.
- Multi-tenant deployment profile (dev/stage/prod config isolation).

## Strategic rewrites
- Consolidate duplicated runtime config into a shared package contract consumed by all apps.
- Move API and worker responsibilities to explicit bounded contexts to reduce coupling.
- Adopt package-level architecture tests to enforce layering and avoid cross-package leaks.
- Evaluate migration to a unified task orchestration layer for long-running operations.
