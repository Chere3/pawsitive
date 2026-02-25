import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

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

    const tier =
      score >= 90
        ? 'Legendary aura 🌈'
        : score >= 70
          ? 'Certified vibe ✅'
          : score >= 40
            ? 'Mixed signals 🤨'
            : 'Needs snacks + nap 💤';

    await ctx.write({
      embeds: [
        createPawsitiveEmbed('Vibe Check', 'primary').setDescription(
          [`Target: **${target.username}**`, `Score: **${score}/100**`, `Status: ${tier}`].join(
            '\n',
          ),
        ),
      ],
    });
  }
}
