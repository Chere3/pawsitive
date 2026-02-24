/**
 * Common types shared across the Pawsitive platform
 */

export interface BotStatus {
  ready: boolean;
  uptime: number;
  guilds: number;
  users: number;
  latency: number;
}

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  uptime: number;
}

export interface ImageProcessingJob {
  id: string;
  userId: string;
  guildId: string;
  imageUrl: string;
  operation: 'blur' | 'sharpen' | 'resize' | 'filter' | 'custom';
  parameters: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  resultUrl?: string;
  error?: string;
}

export interface WebhookPayload {
  type: 'interaction' | 'event';
  data: unknown;
  timestamp: string;
  signature?: string;
}

export interface BotCommand {
  name: string;
  description: string;
  category: 'utility' | 'fun' | 'image' | 'admin';
  usage: string;
  cooldown?: number;
}

export interface GuildSettings {
  guildId: string;
  prefix?: string;
  imageFeatures: {
    enabled: boolean;
    allowedChannels?: string[];
    maxFileSize?: number;
  };
  moderation: {
    enabled: boolean;
    logChannel?: string;
  };
  updatedAt: Date;
}

/**
 * Image interaction types
 */
export interface ImageInteractionRequest {
  imageUrl: string;
  operation: string;
  userId: string;
  guildId: string;
  channelId: string;
  options?: Record<string, unknown>;
}

export interface ImageInteractionResponse {
  success: boolean;
  resultUrl?: string;
  processingTime?: number;
  error?: string;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
