import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { boopLines, getTextMentions, randomItem } from '../lib/fun-tools.js';

const options = {
  user: createUserOption({
    description: 'Who gets booped?',
    required: false,
  }),
};

@Declare({
  name: 'boop',
  description: '🐾 Boop another user (respectfully)',
})
@Options(options)
export default class BoopCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const actor = ctx.author;
    const target = ctx.options.user ?? getTextMentions(ctx)[0];

    if (!target) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Missing user', 'danger').setDescription(
            '> **Uso:** `/boop user:@someone` o `!boop @someone`',
          ),
        ],
      });
      return;
    }

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
