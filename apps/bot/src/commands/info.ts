import { Command, Declare, type CommandContext } from 'seyfert';
import { ActionRow, Button, Embed } from 'seyfert/lib/builders';
import { ButtonStyle } from 'seyfert/lib/types';

@Declare({
  name: 'info',
  description: 'ℹ️ Show information about Pawsitive bot'
})
export default class InfoCommand extends Command {
  async run(ctx: CommandContext) {
    const dashboardUrl = process.env.DASHBOARD_URL ?? 'http://localhost:4321';
    const inviteUrl = process.env.BOT_INVITE_URL ?? 'https://discord.com/oauth2/authorize?client_id=1475710537332691096&scope=bot%20applications.commands&permissions=274878024704';
    const supportUrl = process.env.BOT_SUPPORT_URL ?? 'https://discord.gg/pawsitive';

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
            `[Dashboard](${dashboardUrl})`,
            `[Support Server](${supportUrl})`,
            '[GitHub](https://github.com/Chere3/pawsitive)',
          ].join('\n'),
          inline: false,
        },
      ])
      .setFooter({ text: 'Made with 💜 and Seyfert' })
      .setTimestamp()
      .addFields([{ name: 'Usage', value: '> **Uso:** `/info`', inline: false }]);

    const actions = new ActionRow<Button>().addComponents(
      new Button().setStyle(ButtonStyle.Link).setLabel('Open Dashboard').setURL(dashboardUrl),
      new Button().setStyle(ButtonStyle.Link).setLabel('Invite Bot').setURL(inviteUrl),
      new Button().setStyle(ButtonStyle.Link).setLabel('Support').setURL(supportUrl)
    );

    await ctx.write({ embeds: [embed], components: [actions] });
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
