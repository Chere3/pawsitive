import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { getConfig } from '@pawsitive/config';
import { createLogger } from '@pawsitive/shared';
import { healthRouter } from './routes/health.js';
import { webhookRouter } from './routes/webhook.js';
import { apiRouter } from './routes/api.js';

// Load configuration
const config = getConfig();

// Create logger
const logger = createLogger({
  name: 'pawsitive-api',
  level: config.LOG_LEVEL,
});

logger.info('🚀 Starting Pawsitive API...');

// Create Elysia app
const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Pawsitive API',
          version: '1.0.0',
          description: 'API for Pawsitive Discord bot platform',
        },
        tags: [
          { name: 'Health', description: 'Health check endpoints' },
          { name: 'Webhook', description: 'Discord webhook endpoints' },
          { name: 'API', description: 'Bot control and data endpoints' },
        ],
      },
    })
  )
  // Global state
  .decorate('logger', logger)
  .decorate('config', config)
  .decorate('startTime', Date.now())
  // Request logging
  .onRequest(({ request, logger }) => {
    logger.debug({
      method: request.method,
      url: request.url,
    }, 'Incoming request');
  })
  // Error handling
  .onError(({ error, set }) => {
    logger.error({ error }, 'Request error');
    
    set.status = 500;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  })
  // Mount routers
  .use(healthRouter)
  .use(webhookRouter)
  .use(apiRouter)
  // 404 handler
  .all('*', ({ set }) => {
    set.status = 404;
    return {
      success: false,
      error: 'Not found',
    };
  });

// Start server
app.listen({
  hostname: config.API_HOST,
  port: config.API_PORT,
}, ({ hostname, port }) => {
  logger.info(`🌐 API server running at http://${hostname}:${port}`);
  logger.info(`📚 Swagger docs available at http://${hostname}:${port}/swagger`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('👋 Shutting down API server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('👋 Shutting down API server...');
  process.exit(0);
});
