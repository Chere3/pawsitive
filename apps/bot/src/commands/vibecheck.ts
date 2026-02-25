import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { vibeTier } from '../lib/fun-tools.js';

const options = {
  user: createUserOption({
    description: 'Who gets vibe-checked? (defaults to you)',
    required: false,
  }),
};

@Declare({
  name: 'vibecheck',
  description: '✨ Run a chaotic vibe scan',
})
@Options(options)
export default class VibecheckCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const target = ctx.options.user ?? ctx.interaction.user;
    const score = Math.floor(Math.random() * 101);

    await ctx.write({
      embeds: [
        createPawsitiveEmbed('Vibe Check', 'primary').setDescription(
          [
            `Target: **${target.username}**`,
            `Score: **${score}/100**`,
            `Status: ${vibeTier(score)}`,
          ].join('\n'),
        ),
      ],
    });
  }
}
