import { Embed, createEvent } from 'seyfert';

const PREFIX = process.env.BOT_PREFIX ?? '!';

function toUser(entity: unknown) {
  const maybe = entity as { user?: { id: string; username: string; avatarURL?: (...args: any[]) => string | null }; id?: string; username?: string; avatarURL?: (...args: any[]) => string | null };
  return maybe.user ?? maybe;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

export default createEvent({
  data: { name: 'messageCreate' },
  async run(message, client) {
    if (!message.content?.startsWith(PREFIX)) return;
    if (message.author?.bot) return;

    const [rawName] = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = (rawName ?? '').toLowerCase();

    if (!command) return;

    switch (command) {
      case 'ping': {
        const gatewayLatency = client.gateway.latency;
        await message.reply({
          content: [
            '🏓 **Pong!**',
            `⚡ Gateway: \`${gatewayLatency}ms\``,
            `📊 Uptime: \`${formatUptime(process.uptime())}\``,
          ].join('\n'),
        });
        break;
      }

      case 'info': {
        const embed = new Embed()
          .setTitle('🐾 Pawsitive Bot')
          .setDescription('Professional furry-themed Discord bot platform.')
          .setColor(0x5865f2)
          .addFields([
            {
              name: 'Stats',
              value: `Guilds: ${client.cache.guilds?.count() ?? 0}\nUptime: ${formatUptime(process.uptime())}`,
              inline: true,
            },
            {
              name: 'Quick Commands',
              value: [
                `\`${PREFIX}ping\``,
                `\`${PREFIX}avatar [@user]\``,
                `\`${PREFIX}server\``,
                `\`${PREFIX}boop @user\``,
              ].join('\n'),
              inline: true,
            },
          ]);

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'avatar': {
        const firstMention = message.mentions?.users?.[0];
        const target = firstMention ? toUser(firstMention) : message.author;
        const avatarUrl =
          target.avatarURL?.({ extension: 'png', size: 4096 }) ??
          `https://cdn.discordapp.com/embed/avatars/${Number(target.id) % 5}.png`;

        const embed = new Embed()
          .setTitle(`🖼️ Avatar — ${target.username}`)
          .setColor(0xff6bbb)
          .setImage(avatarUrl)
          .setDescription(`[Open original](${avatarUrl})`);

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'server': {
        if (!message.guildId) {
          await message.reply({ content: 'This command only works inside a server 🐾' });
          return;
        }

        const guild = await message.guild('flow');

        const embed = new Embed()
          .setTitle('🏠 Server Snapshot')
          .setColor(0x43d9bd)
          .addFields([
            { name: 'Guild ID', value: `\`${message.guildId}\``, inline: true },
            { name: 'Name', value: `${guild?.name ?? 'Unknown'}`, inline: true },
            { name: 'Features', value: `${guild?.features?.length ?? 0}`, inline: true },
          ]);

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'boop': {
        const firstMention = message.mentions?.users?.[0];
        if (!firstMention) {
          await message.reply({ content: `Usage: \`${PREFIX}boop @user\`` });
          return;
        }

        const target = toUser(firstMention);
        if (target.id === message.author.id) {
          await message.reply({ content: 'Self-boop unlocked. Cute and valid. 🐾' });
          return;
        }

        const lines = [
          'gives a playful nose boop 🐾',
          'boops with extra floof energy ✨',
          'delivers an elite boop combo 🎯',
          'boops and runs away dramatically 💨',
        ];
        const action = lines[Math.floor(Math.random() * lines.length)];
        await message.reply({
          content: `**${message.author.username}** ${action} **${target.username}**`,
        });
        break;
      }

      case 'help': {
        await message.reply({
          content: [
            `🐾 Prefix commands (${PREFIX})`,
            `- ${PREFIX}ping`,
            `- ${PREFIX}info`,
            `- ${PREFIX}avatar [@user]`,
            `- ${PREFIX}server`,
            `- ${PREFIX}boop @user`,
          ].join('\n'),
        });
        break;
      }

      default:
        break;
    }
  },
});
