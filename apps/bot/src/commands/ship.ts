import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { shipVerdict } from '../lib/fun-tools.js';

const options = {
  user1: createUserOption({
    description: 'First user',
    required: false,
  }),
  user2: createUserOption({
    description: 'Second user',
    required: false,
  }),
};

@Declare({
  name: 'ship',
  description: '💘 Chaotic compatibility meter',
})
@Options(options)
export default class ShipCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const message = (
      ctx as unknown as { message?: { mentions?: { id: string; username: string }[] } }
    ).message;
    const mentionUsers = message?.mentions ?? [];
    const user1 = ctx.options.user1 ?? mentionUsers[0];
    const user2 = ctx.options.user2 ?? mentionUsers[1];

    if (!user1 || !user2) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Missing users', 'danger').setDescription(
            '> **Uso:** `/ship user1:@a user2:@b` o `!ship @a @b`',
          ),
        ],
      });
      return;
    }

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
