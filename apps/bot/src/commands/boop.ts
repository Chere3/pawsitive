import {
  Command,
  Declare,
  Options,
  createUserOption,
  type CommandContext,
} from 'seyfert';

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
      await ctx.write({ content: 'Self-boop unlocked. Cute and valid. 🐾' });
      return;
    }

    const action = lines[Math.floor(Math.random() * lines.length)];
    await ctx.write({
      content: `**${actor.username}** ${action} **${target.username}**`,
    });
  }
}
