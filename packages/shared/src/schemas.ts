import { z } from 'zod';

/**
 * Common Zod schemas for validation across apps
 */

export const imageUrlSchema = z.string().url().refine(
  (url) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url),
  { message: 'URL must point to an image file' }
);

export const discordIdSchema = z.string().regex(/^\d{17,19}$/, 'Invalid Discord ID format');

export const webhookPayloadSchema = z.object({
  type: z.enum(['interaction', 'event']),
  data: z.unknown(),
  timestamp: z.string().datetime(),
  signature: z.string().optional(),
});

export const imageProcessingRequestSchema = z.object({
  imageUrl: imageUrlSchema,
  operation: z.enum(['blur', 'sharpen', 'resize', 'filter', 'custom']),
  userId: discordIdSchema,
  guildId: discordIdSchema,
  channelId: discordIdSchema,
  options: z.record(z.unknown()).optional(),
});

export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'down']),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number(),
});
