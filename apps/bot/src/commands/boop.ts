import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { boopLines, randomItem } from '../lib/fun-tools.js';

const options = {
  user: createUserOption({
    description: 'Who gets booped?',
    required: true,
  }),
};

@Declare({
  name: 'boop',
  description: '🐾 Boop another user (respectfully)',
})
@Options(options)
export default class BoopCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const actor = ctx.interaction.user;
    const target = ctx.options.user;

    if (target.id === actor.id) {
      const embed = createPawsitiveEmbed('Self boop', 'accent').setDescription(
        ['Self-boop unlocked. Cute and valid.', '', '> **Uso:** `/boop user:@someone`'].join('\n'),
      );
      await ctx.write({ embeds: [embed] });
      return;
    }

    const action = randomItem(boopLines);
    const embed = createPawsitiveEmbed('Boop Delivered', 'accent').setDescription(
      [
        `**${actor.username}** ${action} **${target.username}**`,
        '',
        '> **Uso:** `/boop user:@someone`',
      ].join('\n'),
    );

    await ctx.write({ embeds: [embed] });
  }
}
