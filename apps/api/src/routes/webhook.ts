import { Elysia, t } from 'elysia';

export const webhookRouter = new Elysia({ prefix: '/webhook' })
  .post(
    '/discord',
    async ({ body, set }) => {
      // TODO: Access logger via dependency injection or context
      console.log('Received Discord webhook:', body.type);
      
      // TODO: Implement Discord interaction verification
      // - Verify signature using BOT_PUBLIC_KEY
      // - Handle PING interactions (type 1)
      // - Route to appropriate handlers
      
      // For now, return a basic response
      set.status = 200;
      
      return {
        success: true,
        message: 'Webhook received',
      };
    },
    {
      body: t.Object({
        type: t.Number(),
        data: t.Optional(t.Unknown()),
        timestamp: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Webhook'],
        summary: 'Discord webhook endpoint',
        description: 'Receives and processes Discord interaction webhooks',
      },
    }
  )
  .get(
    '/discord/status',
    () => ({
      enabled: true,
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        tags: ['Webhook'],
        summary: 'Webhook status',
        description: 'Returns the status of the Discord webhook endpoint',
      },
    }
  );
