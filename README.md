# 🐾 Pawsitive

A professional furry-themed Discord bot platform with advanced image interactions, built as a modern monorepo.

## 🏗️ Architecture

Pawsitive is built as a **pnpm monorepo** with the following structure:

```
pawsitive/
├── apps/
│   ├── bot/          # Discord bot (Seyfert framework)
│   ├── api/          # REST API (Elysia framework)
│   └── dashboard/    # Web dashboard (Astro)
├── packages/
│   ├── config/       # Environment & configuration management
│   ├── types/        # Shared TypeScript types
│   └── shared/       # Shared utilities (logger, schemas, helpers)
└── pnpm-workspace.yaml
```

### Technology Stack

- **Bot**: [Seyfert](https://www.seyfert.dev/) - Modern Discord bot framework
- **API**: [Elysia](https://elysiajs.com/) - Ultra-fast Bun-powered web framework
- **Dashboard**: [Astro](https://astro.build/) - Modern static site framework
- **Package Manager**: pnpm with workspaces
- **Language**: TypeScript
- **Styling**: Tailwind CSS (dashboard)
- **Logging**: Pino
- **Validation**: Zod

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for bot and shared packages)
- **Bun** (for API) - Install from [bun.sh](https://bun.sh)
- **pnpm** - `npm install -g pnpm`
- **Discord Bot Token** - Get from [Discord Developer Portal](https://discord.com/developers/applications)

### Installation

1. **Clone the repository**

```bash
cd /home/diego/Proyectos/pawsitive
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
# Bot
cp apps/bot/.env.example apps/bot/.env
# Edit apps/bot/.env and add your BOT_TOKEN

# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env if needed

# Dashboard
cp apps/dashboard/.env.example apps/dashboard/.env
# Edit apps/dashboard/.env if needed
```

4. **Build shared packages**

```bash
pnpm --filter @pawsitive/config build
pnpm --filter @pawsitive/types build
pnpm --filter @pawsitive/shared build
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run individual apps:

```bash
# Bot only
pnpm bot:dev

# API only
pnpm api:dev

# Dashboard only
pnpm dashboard:dev
```

### First-Time Bot Setup

On first run, you need to upload commands to Discord:

```bash
# Set UPLOAD_COMMANDS=true in apps/bot/.env
# Then run the bot
pnpm bot:dev
```

## 📦 Packages

### Apps

#### `@pawsitive/bot`

Discord bot built with Seyfert.

- **Port**: N/A (Discord Gateway)
- **Commands**: `/ping`, `/info`
- **Events**: `botReady`, `guildCreate`
- **Features**: 
  - Command framework
  - Event handling
  - Image interaction abstraction layer
  - Environment validation
  - Structured logging

**Key Files:**
- `src/index.ts` - Bot entry point
- `src/commands/` - Slash commands
- `src/events/` - Event handlers
- `src/lib/image-interactions.ts` - Image processing module
- `seyfert.config.mjs` - Seyfert configuration

#### `@pawsitive/api`

REST API built with Elysia.

- **Port**: 3000 (default)
- **Swagger**: http://localhost:3000/swagger
- **Features**:
  - Health check endpoints
  - Webhook handling (Discord interactions)
  - Bot status API
  - Image processing queue (stub)
  - Authentication ready (stub)

**Endpoints:**
- `GET /health` - Health check
- `GET /health/version` - API version
- `GET /health/ready` - Readiness probe
- `POST /webhook/discord` - Discord webhook
- `GET /api/bot/status` - Bot status
- `POST /api/image/process` - Queue image processing
- `GET /api/image/job/:jobId` - Get job status

#### `@pawsitive/dashboard`

Web dashboard built with Astro + Tailwind CSS.

- **Port**: 4321 (default)
- **URL**: http://localhost:4321
- **Features**:
  - Bot status overview
  - Feature showcase
  - Modern responsive UI
  - Server-side rendering

### Shared Packages

#### `@pawsitive/config`

Environment configuration and validation.

- Zod schemas for environment variables
- Type-safe configuration access
- Validation on startup

#### `@pawsitive/types`

Shared TypeScript types and interfaces.

- Bot status types
- API response types
- Image processing types
- Domain models

#### `@pawsitive/shared`

Shared utilities and helpers.

- **Logger**: Pino-based structured logging
- **Schemas**: Zod validation schemas
- **Utils**: Format helpers, retry logic, ID generation

## 🎨 Features

### Current Features

✅ **Discord Bot**
- Slash command framework
- Event handling
- Latency monitoring
- Multi-guild support

✅ **REST API**
- Health checks
- Webhook endpoints
- Swagger documentation
- CORS support

✅ **Web Dashboard**
- Status overview
- Feature showcase
- Responsive design

### Planned Features (Roadmap)

🚧 **Image Processing**
- Upload and process images
- Filters and effects
- Format conversion
- Bulk operations

🚧 **Advanced Bot Features**
- Moderation tools
- Custom reactions
- Role management
- Server analytics

🚧 **Dashboard Enhancements**
- Real-time bot status
- Command management UI
- Guild settings
- Analytics dashboard

🚧 **Infrastructure**
- Database integration (PostgreSQL)
- Redis caching
- Job queue (BullMQ)
- Image CDN integration

## 🛠️ Development

### Scripts

```bash
# Development
pnpm dev              # Run all apps in parallel
pnpm bot:dev          # Run bot only
pnpm api:dev          # Run API only
pnpm dashboard:dev    # Run dashboard only

# Build
pnpm build            # Build all packages

# Type checking
pnpm typecheck        # Type check all packages

# Linting (placeholder)
pnpm lint             # Lint all packages

# Clean
pnpm clean            # Remove all build artifacts
```

### Project Structure

```
pawsitive/
├── apps/
│   ├── bot/
│   │   ├── src/
│   │   │   ├── commands/       # Slash commands
│   │   │   ├── events/         # Event handlers
│   │   │   ├── lib/            # Utilities
│   │   │   └── index.ts        # Entry point
│   │   ├── seyfert.config.mjs  # Bot config
│   │   └── .env.example
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   └── index.ts        # Entry point
│   │   └── .env.example
│   └── dashboard/
│       ├── src/
│       │   ├── components/     # Astro components
│       │   ├── layouts/        # Page layouts
│       │   └── pages/          # Routes
│       ├── astro.config.mjs
│       └── tailwind.config.mjs
├── packages/
│   ├── config/
│   │   └── src/index.ts        # Environment validation
│   ├── types/
│   │   └── src/index.ts        # Type definitions
│   └── shared/
│       └── src/
│           ├── logger.ts       # Logger setup
│           ├── schemas.ts      # Zod schemas
│           └── utils.ts        # Utilities
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

### Adding New Commands

1. Create a new file in `apps/bot/src/commands/`

```typescript
import { Command, Declare, type CommandContext } from 'seyfert';

@Declare({
  name: 'yourcommand',
  description: 'Your command description'
})
export default class YourCommand extends Command {
  async run(ctx: CommandContext) {
    await ctx.write({
      content: 'Hello from your command!'
    });
  }
}
```

2. Restart the bot (commands are auto-loaded)

3. Upload commands to Discord:

```bash
# Set UPLOAD_COMMANDS=true in .env
pnpm bot:dev
```

### Adding API Endpoints

1. Create or edit a route file in `apps/api/src/routes/`

```typescript
import { Elysia } from 'elysia';

export const myRouter = new Elysia({ prefix: '/my' })
  .get('/', () => ({ message: 'Hello!' }));
```

2. Import and use in `apps/api/src/index.ts`

```typescript
import { myRouter } from './routes/my.js';

const app = new Elysia()
  .use(myRouter)
  // ...
```

## 🔒 Environment Variables

### Bot (`apps/bot/.env`)

```env
BOT_TOKEN=            # Required - Discord bot token
BOT_PUBLIC_KEY=       # Optional - For HTTP interactions
NODE_ENV=development  # development | production
LOG_LEVEL=info        # trace | debug | info | warn | error | fatal
UPLOAD_COMMANDS=false # Set to true to upload commands on startup
```

### API (`apps/api/.env`)

```env
API_PORT=3000
API_HOST=0.0.0.0
API_SECRET=           # Optional - API authentication secret
NODE_ENV=development
LOG_LEVEL=info
```

### Dashboard (`apps/dashboard/.env`)

```env
PUBLIC_API_URL=http://localhost:3000
PUBLIC_BOT_INVITE_URL=https://discord.com/oauth2/authorize?client_id=YOUR_ID
PUBLIC_SUPPORT_SERVER_URL=https://discord.gg/your-server
```

## 📝 Image Interactions

The bot includes an abstraction layer for image processing (`apps/bot/src/lib/image-interactions.ts`):

### Features (Planned)

- Image validation (type, size, dimensions)
- Download from URL
- Process with various operations:
  - Blur/sharpen
  - Resize/crop
  - Filters
  - Format conversion

### Integration Points

1. **Bot Commands**: Users upload images via Discord
2. **Image Handler**: Validates and queues processing
3. **API**: Processes images asynchronously
4. **Response**: Returns processed image to Discord

### Recommended Libraries

For future implementation, consider:

- **sharp** - High-performance image processing (Node.js)
- **jimp** - Pure JavaScript image library
- **canvas** - Drawing and compositing
- **Cloudinary** - Cloud-based image processing

## 🚀 Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Start in production
NODE_ENV=production node apps/bot/dist/index.js
NODE_ENV=production bun run apps/api/src/index.ts
# Dashboard: Deploy to Vercel/Netlify/Cloudflare Pages
```

### Deployment Targets

- **Bot**: Any Node.js hosting (Railway, Fly.io, VPS)
- **API**: Bun-compatible hosting (Fly.io, VPS)
- **Dashboard**: Static hosting (Vercel, Netlify, Cloudflare Pages)

### Docker (TODO)

Docker support is planned for easier deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- [Seyfert](https://www.seyfert.dev/) - Amazing Discord bot framework
- [Elysia](https://elysiajs.com/) - Blazingly fast web framework
- [Astro](https://astro.build/) - Modern web framework
- The furry community 🐾

---

**Made with 💜 by the Pawsitive team**
