import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const options = {
  text: createStringOption({
    description: 'Text to convert into mock case',
    required: true,
    max_length: 300,
  }),
};

function mockCase(input: string) {
  return input
    .split('')
    .map((ch, i) => (i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()))
    .join('');
}

@Declare({
  name: 'mock',
  description: '🗯️ sPoNgEbOb mOcK cAsE converter',
})
@Options(options)
export default class MockCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const output = mockCase(ctx.options.text);

    await ctx.write({
      embeds: [createPawsitiveEmbed('Mock Case', 'accent').setDescription(`**${output}**`)],
    });
  }
}
