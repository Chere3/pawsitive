import { Command, type CommandContext, createUserOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const options = {
  user: createUserOption({
    description: 'User to inspect (optional)',
    required: false,
  }),
};

@Declare({
  name: 'avatar',
  description: '🖼️ Show a user avatar in high quality',
})
@Options(options)
export default class AvatarCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const target = ctx.options.user ?? ctx.interaction.user;
    const avatarUrl =
      target.avatarURL?.({ extension: 'png', size: 4096 }) ??
      `https://cdn.discordapp.com/embed/avatars/${Number(target.id) % 5}.png`;

    const embed = createPawsitiveEmbed(`Avatar — ${target.username}`, 'accent')
      .setImage(avatarUrl)
      .setDescription(
        [`[Open original](${avatarUrl})`, '', '> **Uso:** `/avatar [user]`'].join('\n'),
      )
      .setFooter({ text: 'Pawsitive • Avatar Lookup' });

    await ctx.write({ embeds: [embed] });
  }
}
