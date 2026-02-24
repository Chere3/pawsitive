import { Command, Declare, type CommandContext } from 'seyfert';
import { Embed } from 'seyfert/lib/builders';

@Declare({
  name: 'info',
  description: 'ℹ️ Show information about Pawsitive bot'
})
export default class InfoCommand extends Command {
  async run(ctx: CommandContext) {
    const embed = new Embed()
      .setTitle('🐾 Pawsitive Bot')
      .setDescription('A professional furry-themed Discord bot platform with advanced image interactions!')
      .setColor(0x5865F2)
      .addFields([
        {
          name: '📊 Stats',
          value: [
            `Guilds: ${ctx.client.cache.guilds?.count() ?? 0}`,
            `Uptime: ${formatUptime(process.uptime())}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🛠️ Features',
          value: [
            '✅ Image Processing',
            '✅ Moderation Tools',
            '✅ Fun Commands',
            '✅ Web Dashboard',
          ].join('\n'),
          inline: true,
        },
        {
          name: '🔗 Links',
          value: [
            '[Dashboard](https://pawsitive.app)',
            '[Support Server](https://discord.gg/pawsitive)',
            '[GitHub](https://github.com/yourname/pawsitive)',
          ].join('\n'),
          inline: false,
        },
      ])
      .setFooter({ text: 'Made with 💜 and Seyfert' })
      .setTimestamp();

    await ctx.write({ embeds: [embed] });
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}
