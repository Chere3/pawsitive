import { Command, Declare, type CommandContext } from 'seyfert';
import { Embed } from 'seyfert/lib/builders';

@Declare({
  name: 'server',
  description: '🏠 Show current server stats',
})
export default class ServerCommand extends Command {
  async run(ctx: CommandContext) {
    const guild = ctx.interaction.guild;

    if (!guild) {
      const embed = new Embed()
        .setTitle('⚠️ Command unavailable')
        .setColor(0xed4245)
        .setDescription(['This command only works inside a server 🐾', '', '> **Uso:** `/server`'].join('\n'));
      await ctx.write({ embeds: [embed] });
      return;
    }

    const embed = new Embed()
      .setTitle('🏠 Server Snapshot')
      .setColor(0x43d9bd)
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
