import 'dotenv/config';
import { Client } from 'seyfert';
import type { ParseClient } from 'seyfert';
import { validateEnv } from '@pawsitive/config';
import { createLogger } from '@pawsitive/shared';

// Validate environment
const env = validateEnv();

// Create logger
const logger = createLogger({
  name: 'pawsitive-bot',
  level: env.LOG_LEVEL,
});

logger.info('🐾 Starting Pawsitive Discord Bot...');

// Extend Seyfert types
declare module 'seyfert' {
  interface UsingClient extends ParseClient<Client<true>> {}
}

// Create and configure client
const client = new Client();

// Use our logger (Seyfert has its own logger, we'll use ours separately)
// Access as 'logger' in this module, not client.logger

// Start the bot
client
  .start()
  .then(async () => {
    logger.info('🎉 Bot started successfully!');
    
    // Upload commands to Discord
    if (process.env.UPLOAD_COMMANDS === 'true') {
      logger.info('📤 Uploading commands to Discord...');
      await client.uploadCommands();
      logger.info('✅ Commands uploaded!');
    }
  })
  .catch((error) => {
    logger.error('❌ Failed to start bot:', error);
    process.exit(1);
  });

// Handle shutdown
process.on('SIGINT', () => {
  logger.info('👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('👋 Shutting down gracefully...');
  process.exit(0);
});
