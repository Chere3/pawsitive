import { z } from 'zod';

/**
 * Environment configuration schema
 */
export const envSchema = z.object({
  // Bot
  BOT_TOKEN: z.string().min(1, 'Bot token is required'),
  BOT_PUBLIC_KEY: z.string().optional(),
  
  // API
  API_PORT: z.coerce.number().default(3000),
  API_HOST: z.string().default('0.0.0.0'),
  API_SECRET: z.string().optional(),
  
  // Database (future)
  DATABASE_URL: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(env);
  
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

/**
 * Get validated environment configuration
 */
export function getConfig(): Env {
  return validateEnv();
}

export default { validateEnv, getConfig };
