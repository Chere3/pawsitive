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

    const embed = new Embed()
      .setTitle(`🖼️ Avatar — ${target.username}`)
      .setColor(0xff6bbb)
      .setImage(avatarUrl)
      .setDescription(`[Open original](${avatarUrl})`)
      .setFooter({ text: 'Pawsitive • Avatar Lookup' });

    await ctx.write({ embeds: [embed] });
  }
}
