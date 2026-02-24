import {
  Command,
  Declare,
  Options,
  createUserOption,
  type CommandContext,
} from 'seyfert';
import { Embed } from 'seyfert/lib/builders';

const options = {
  user: createUserOption({
    description: 'Who gets booped?',
    required: true,
  }),
};

const lines = [
  'gives a playful nose boop 🐾',
  'boops with extra floof energy ✨',
  'delivers an elite boop combo 🎯',
  'boops and runs away dramatically 💨',
];

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
      const embed = new Embed()
        .setTitle('🐾 Self boop')
        .setColor(0xff6bbb)
        .setDescription(['Self-boop unlocked. Cute and valid.', '', '> **Uso:** `/boop user:@someone`'].join('\n'));
      await ctx.write({ embeds: [embed] });
      return;
    }

    const action = lines[Math.floor(Math.random() * lines.length)];
    const embed = new Embed()
      .setTitle('🐾 Boop Delivered')
      .setColor(0xff6bbb)
      .setDescription([`**${actor.username}** ${action} **${target.username}**`, '', '> **Uso:** `/boop user:@someone`'].join('\n'));

    await ctx.write({ embeds: [embed] });
  }
}
