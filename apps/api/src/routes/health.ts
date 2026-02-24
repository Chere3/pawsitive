import { Elysia } from 'elysia';

const VERSION = '1.0.0';
const START_TIME = Date.now();

export const healthRouter = new Elysia({ prefix: '/health' })
  .get(
    '/',
    () => {
      const uptime = Math.floor((Date.now() - START_TIME) / 1000);

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: VERSION,
        uptime,
      };
    },
    {
      detail: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the health status of the API server',
      },
    }
  )
  .get(
    '/version',
    () => ({
      version: VERSION,
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        tags: ['Health'],
        summary: 'Get API version',
        description: 'Returns the current API version',
      },
    }
  )
  .get(
    '/ready',
    ({ set }) => {
      const ready = true;

      set.status = ready ? 200 : 503;

      return {
        ready,
        timestamp: new Date().toISOString(),
      };
    },
    {
      detail: {
        tags: ['Health'],
        summary: 'Readiness check',
        description: 'Returns whether the API is ready to handle requests',
      },
    }
  );
