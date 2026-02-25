import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { resolveStringInput, uwuify } from '../lib/fun-tools.js';

const options = {
  text: createStringOption({
    description: 'Text to uwu-fy',
    required: false,
    max_length: 300,
  }),
};

@Declare({
  name: 'uwu',
  description: '🧸 Convert text to uwu mode',
})
@Options(options)
export default class UwuCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const input = resolveStringInput(ctx, 'text', process.env.BOT_PREFIX ?? '!');

    if (!input) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Missing text', 'danger').setDescription(
            '> **Uso:** `/uwu text:...` o `!uwu hola`',
          ),
        ],
      });
      return;
    }

    const converted = uwuify(input);

    await ctx.write({
      embeds: [
        createPawsitiveEmbed('Uwu Converter', 'accent').setDescription(
          [`Original: ${ctx.options.text}`, '', `Converted: **${converted}**`].join('\n'),
        ),
      ],
    });
  }
}
