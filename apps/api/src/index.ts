import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { getConfig } from '@pawsitive/config';
import { createLogger } from '@pawsitive/shared';
import { healthRouter } from './routes/health.js';
import { webhookRouter } from './routes/webhook.js';
import { apiRouter } from './routes/api.js';
import { authRouter } from './routes/auth.js';

const config = getConfig();

const logger = createLogger({
  name: 'pawsitive-api',
  level: config.LOG_LEVEL,
  pretty: false,
});

logger.info('🚀 Starting Pawsitive API...');

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:4321')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  )
  .decorate('logger', logger)
  .decorate('config', config)
  .decorate('startTime', Date.now())
  .onRequest(({ request, logger }) => {
    logger.debug(
      {
        method: request.method,
        url: request.url,
      },
      'Incoming request'
    );
  })
  .onError(({ error, set }) => {
    logger.error({ error }, 'Request error');
    set.status = 500;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  })
  .use(healthRouter)
  .use(webhookRouter)
  .use(apiRouter)
  .use(authRouter)
  .all('*', ({ set }) => {
    set.status = 404;
    return {
      success: false,
      error: 'Not found',
    };
  });

app.listen(
  {
    hostname: config.API_HOST,
    port: config.API_PORT,
  },
  ({ hostname, port }) => {
    logger.info(`🌐 API server running at http://${hostname}:${port}`);
  }
);

process.on('SIGINT', () => {
  logger.info('👋 Shutting down API server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('👋 Shutting down API server...');
  process.exit(0);
});
