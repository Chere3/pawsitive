import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { clapify, resolveStringInput } from '../lib/fun-tools.js';

const options = {
  text: createStringOption({
    description: 'Text to clapify',
    required: false,
    max_length: 300,
  }),
};

@Declare({
  name: 'clap',
  description: '👏 Add dramatic clap spacing',
})
@Options(options)
export default class ClapCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const input = resolveStringInput(ctx, 'text', process.env.BOT_PREFIX ?? '!');

    if (!input) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Missing text', 'danger').setDescription(
            '> **Uso:** `/clap text:...` o `!clap esto va fuerte`',
          ),
        ],
      });
      return;
    }

    const output = clapify(input);

    await ctx.write({
      embeds: [createPawsitiveEmbed('Clapifier', 'primary').setDescription(`**${output}**`)],
    });
  }
}
