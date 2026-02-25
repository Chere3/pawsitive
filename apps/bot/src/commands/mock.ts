import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { mockCase, textTailFromMessage } from '../lib/fun-tools.js';

const options = {
  text: createStringOption({
    description: 'Text to convert into mock case',
    required: false,
    max_length: 300,
  }),
};

@Declare({
  name: 'mock',
  description: '🗯️ sPoNgEbOb mOcK cAsE converter',
})
@Options(options)
export default class MockCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const message = (ctx as unknown as { message?: { content?: string } }).message;
    const input =
      ctx.options.text ??
      textTailFromMessage(message?.content, ctx.fullCommandName, process.env.BOT_PREFIX ?? '!');

    if (!input) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Missing text', 'danger').setDescription(
            '> **Uso:** `/mock text:...` o `!mock no me hables así`',
          ),
        ],
      });
      return;
    }

    const output = mockCase(input);

    await ctx.write({
      embeds: [createPawsitiveEmbed('Mock Case', 'accent').setDescription(`**${output}**`)],
    });
  }
}
