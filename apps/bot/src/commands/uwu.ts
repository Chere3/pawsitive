import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const options = {
  text: createStringOption({
    description: 'Text to uwu-fy',
    required: true,
    max_length: 300,
  }),
};

function uwuify(input: string) {
  return input
    .replace(/[rl]/g, 'w')
    .replace(/[RL]/g, 'W')
    .replace(/n([aeiou])/gi, 'ny$1')
    .replace(/ove/gi, 'uv')
    .replace(/!+/g, ' uwu!');
}

@Declare({
  name: 'uwu',
  description: '🧸 Convert text to uwu mode',
})
@Options(options)
export default class UwuCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const converted = uwuify(ctx.options.text);

    await ctx.write({
      embeds: [
        createPawsitiveEmbed('Uwu Converter', 'accent').setDescription(
          [`Original: ${ctx.options.text}`, '', `Converted: **${converted}**`].join('\n'),
        ),
      ],
    });
  }
}
