import { createEvent } from 'seyfert';

export default createEvent({
  data: { name: 'guildCreate' },
  run(guild, client) {
    client.logger.info(`🏠 Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
  },
});
