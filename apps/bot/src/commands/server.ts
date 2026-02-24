import { Command, Declare, type CommandContext } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

@Declare({
  name: 'server',
  description: '🏠 Show current server stats',
})
export default class ServerCommand extends Command {
  async run(ctx: CommandContext) {
    const guild = ctx.interaction.guild;

    if (!guild) {
      const embed = createPawsitiveEmbed('Command unavailable', 'danger')
        .setDescription(['This command only works inside a server 🐾', '', '> **Uso:** `/server`'].join('\n'));
      await ctx.write({ embeds: [embed] });
      return;
    }

    const embed = createPawsitiveEmbed('Server Snapshot', 'success')
      .addFields([
        { name: 'Guild ID', value: `\`${guild.id}\``, inline: true },
        { name: 'Locale', value: `${guild.locale ?? 'N/A'}`, inline: true },
        { name: 'Features', value: `${guild.features?.length ?? 0}`, inline: true },
        { name: 'Usage', value: '> **Uso:** `/server`', inline: false },
      ])
      .setFooter({ text: 'Pawsitive • Server Insights' });

    await ctx.write({ embeds: [embed] });
  }
}
