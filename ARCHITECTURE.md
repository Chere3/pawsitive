# Pawsitive Architecture

## Overview

Pawsitive is built as a **monorepo** using pnpm workspaces, enabling code sharing and unified dependency management across multiple applications.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Discord API                          │
└────────────┬─────────────────────────┬──────────────────┘
             │                         │
             │ Gateway (WebSocket)     │ HTTP Interactions
             │                         │
             ▼                         ▼
┌────────────────────────┐   ┌─────────────────────────┐
│    Bot (Seyfert)       │◄──┤   API (Elysia)          │
│  - Commands            │   │  - Webhooks             │
│  - Events              │   │  - REST endpoints       │
│  - Image handling      │   │  - Job processing       │
└────────┬───────────────┘   └──────────┬──────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌────────────────────────────────────────────────────────┐
│              Shared Packages                           │
│  - @pawsitive/config   (env validation)                │
│  - @pawsitive/types    (type definitions)              │
│  - @pawsitive/shared   (logger, utils, schemas)        │
└────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌────────────────────────────────────────────────────────┐
│         External Services (Future)                     │
│  - PostgreSQL (database)                               │
│  - Redis (caching)                                     │
│  - S3/CDN (image storage)                              │
│  - BullMQ (job queue)                                  │
└────────────────────────────────────────────────────────┘
                         ▲
                         │
                         │
                ┌────────┴────────┐
                │   Dashboard     │
                │    (Astro)      │
                │  - Status UI    │
                │  - Management   │
                └─────────────────┘
```

## Application Layers

### 1. Presentation Layer

#### Bot (apps/bot)
- **Framework**: Seyfert (Discord.js alternative)
- **Runtime**: Node.js 18+
- **Responsibilities**:
  - Handle Discord Gateway events
  - Process slash commands
  - Manage interactions (buttons, modals, selects)
  - Image upload/download coordination
  - Real-time user interactions

#### Dashboard (apps/dashboard)
- **Framework**: Astro + Tailwind CSS
- **Build**: Static Site Generation (SSG)
- **Responsibilities**:
  - Display bot status
  - Show feature information
  - Guild management UI (future)
  - Analytics dashboard (future)

### 2. Application Layer

#### API (apps/api)
- **Framework**: Elysia (Bun-powered)
- **Runtime**: Bun
- **Responsibilities**:
  - HTTP interaction webhooks
  - REST API for bot control
  - Image processing job management
  - Authentication & authorization
  - Rate limiting
  - External integrations

### 3. Domain Layer

#### Shared Packages (packages/*)
- **@pawsitive/config**: Environment & configuration
- **@pawsitive/types**: Type definitions
- **@pawsitive/shared**: Common utilities

**Responsibilities**:
- Business logic abstraction
- Data validation (Zod schemas)
- Logging infrastructure
- Type safety across apps
- Shared constants

## Data Flow

### Command Execution Flow

```
User → Discord → Bot
                 ├─→ Validate command
                 ├─→ Check permissions
                 ├─→ Execute handler
                 └─→ Send response → Discord → User
```

### Image Processing Flow (Planned)

```
User uploads image → Discord
                     ↓
                  Bot receives attachment
                     ↓
                  Validate image (size, type)
                     ↓
                  Send to API → Queue job
                     ↓
                  Process image (sharp/jimp)
                     ↓
                  Upload to CDN
                     ↓
                  Notify bot ← Job complete
                     ↓
                  Send result → Discord → User
```

### Webhook Flow

```
Discord → API /webhook/discord
          ├─→ Verify signature
          ├─→ Route to handler
          └─→ Process & respond
```

## Technology Choices

### Why Seyfert?

- **Modern**: Built for current Discord API
- **Type-safe**: Full TypeScript support
- **Decorator-based**: Clean, declarative syntax
- **Performant**: Optimized for scale
- **Active**: Well-maintained with good docs

### Why Elysia?

- **Speed**: 3-10x faster than Express
- **Bun-native**: Leverages Bun's performance
- **Type-safe**: End-to-end TypeScript
- **Built-in**: Swagger, validation, compression
- **Small**: Minimal overhead

### Why Astro?

- **Fast**: Ships zero JS by default
- **Flexible**: Use any framework (React, Vue, Svelte)
- **SSG**: Perfect for dashboards
- **DX**: Great developer experience
- **Islands**: Partial hydration for interactivity

### Why pnpm?

- **Fast**: Faster installs than npm/yarn
- **Efficient**: Content-addressed storage (saves disk space)
- **Strict**: Better dependency isolation
- **Monorepo**: Excellent workspace support

## Design Patterns

### 1. Separation of Concerns

Each app has a single, clear responsibility:
- **Bot**: Discord interactions only
- **API**: HTTP endpoints & processing
- **Dashboard**: User interface

### 2. Shared Kernel

Common types, utilities, and schemas in shared packages prevent duplication and ensure consistency.

### 3. Dependency Injection

Services (logger, config) are injected into handlers, making them testable and modular.

### 4. Environment-based Configuration

All configuration comes from environment variables, validated at startup with Zod schemas.

### 5. Event-Driven Architecture (Future)

Bot emits events → API processes → Results notify bot

## Scaling Strategies

### Horizontal Scaling

#### Bot
- **Sharding**: Seyfert supports built-in sharding
- **Multi-instance**: Run multiple bot instances with different shard ranges
- **Load balancing**: Discord handles shard distribution

#### API
- **Stateless**: API is fully stateless (no sessions)
- **Load balancer**: Nginx/Caddy in front of multiple API instances
- **Caching**: Redis for frequently accessed data

### Vertical Scaling

- Increase resources for compute-heavy operations (image processing)
- Use worker threads for parallel processing

## Security Considerations

### Bot
- ✅ Token in environment variables (never in code)
- ✅ Permission checks before command execution
- 🚧 Rate limiting per user/guild
- 🚧 Input sanitization

### API
- ✅ CORS configuration
- 🚧 Webhook signature verification (Discord)
- 🚧 API key authentication
- 🚧 Rate limiting
- 🚧 Request validation (Zod schemas)

### Dashboard
- 🚧 OAuth2 authentication (Discord)
- 🚧 CSRF protection
- 🚧 XSS prevention

## Performance Optimizations

### Current
- Structured logging (Pino) - faster than console.log
- Elysia's native performance (Bun)
- Astro's zero-JS default

### Planned
- **Caching**: Redis for bot status, guild settings
- **CDN**: Cloudflare for dashboard & images
- **Database indexing**: Optimized queries
- **Connection pooling**: PostgreSQL
- **Image optimization**: Sharp + CDN
- **Lazy loading**: Dashboard components

## Testing Strategy (TODO)

### Unit Tests
- Shared utilities
- Validation schemas
- Business logic

### Integration Tests
- API endpoints
- Bot commands (mock Discord)
- Database operations

### E2E Tests
- Full user flows
- Dashboard interactions

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Cloudflare (CDN)               │
│  - Dashboard (static)                    │
│  - Image CDN (future)                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)            │
└────────┬──────────────────┬─────────────┘
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│   API Instance  │  │   API Instance  │
│     (Bun)       │  │     (Bun)       │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    │
         ┌──────────▼──────────┐
         │   PostgreSQL        │
         │   Redis             │
         └─────────────────────┘

┌─────────────────────────────────────────┐
│         Bot Instance(s)                  │
│  - Discord Gateway                       │
│  - Sharded (if needed)                   │
└─────────────────────────────────────────┘
```

## Future Enhancements

### Phase 2: Core Features
- [ ] Database integration (PostgreSQL)
- [ ] Image processing implementation (sharp)
- [ ] Job queue (BullMQ)
- [ ] Redis caching

### Phase 3: Advanced Features
- [ ] Multi-guild configuration
- [ ] Analytics & metrics
- [ ] Dashboard authentication (OAuth2)
- [ ] Advanced moderation tools

### Phase 4: Scale & Performance
- [ ] Sharding support
- [ ] Microservices architecture
- [ ] GraphQL API (optional)
- [ ] Real-time dashboard updates (WebSocket)

## Monitoring & Observability (TODO)

- **Logging**: Pino → Aggregation service (DataDog, LogDNA)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Uptime**: UptimeRobot or custom health checks
- **Error tracking**: Sentry

---

**Last Updated**: 2026-02-23
