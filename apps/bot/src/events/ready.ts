import { createEvent } from 'seyfert';

export default createEvent({
  data: { name: 'botReady', once: true },
  run(user, client) {
    // Use Seyfert's built-in logger
    client.logger.info(`🤖 Bot is ready! Logged in as ${user.username}#${user.discriminator}`);
    client.logger.info(`📊 Serving ${client.cache.guilds?.count() ?? 0} guilds`);
  },
});
