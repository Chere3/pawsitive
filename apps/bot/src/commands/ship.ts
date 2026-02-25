import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { shipVerdict } from '../lib/fun-tools.js';

const options = {
  user1: createUserOption({
    description: 'First user',
    required: true,
  }),
  user2: createUserOption({
    description: 'Second user',
    required: true,
  }),
};

@Declare({
  name: 'ship',
  description: '💘 Chaotic compatibility meter',
})
@Options(options)
export default class ShipCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const { user1, user2 } = ctx.options;
    const score = Math.floor(Math.random() * 101);

    await ctx.write({
      embeds: [
        createPawsitiveEmbed('Ship Meter', 'accent').setDescription(
          [
            `Pair: **${user1.username}** × **${user2.username}**`,
            `Compatibility: **${score}%**`,
            `Verdict: ${shipVerdict(score)}`,
          ].join('\n'),
        ),
      ],
    });
  }
}
