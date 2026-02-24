import pino from 'pino';
import type { LogLevel } from '@pawsitive/types';

/**
 * Create a configured logger instance
 */
export function createLogger(options: {
  name: string;
  level?: LogLevel;
  pretty?: boolean;
}) {
  const { name, level = 'info', pretty = process.env.NODE_ENV !== 'production' } = options;

  return pino({
    name,
    level,
    transport: pretty ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    } : undefined,
  });
}

export type Logger = ReturnType<typeof createLogger>;
