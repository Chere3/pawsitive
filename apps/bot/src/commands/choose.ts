import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { parseChoices, randomItem, textTailFromMessage } from '../lib/fun-tools.js';

const options = {
  choices: createStringOption({
    description: 'Comma-separated options (e.g. cats,dogs,snacks)',
    required: false,
    max_length: 300,
  }),
};

@Declare({
  name: 'choose',
  description: '🤔 Choose one option for you',
})
@Options(options)
export default class ChooseCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const message = (ctx as unknown as { message?: { content?: string } }).message;
    const raw =
      ctx.options.choices ??
      textTailFromMessage(message?.content, ctx.fullCommandName, process.env.BOT_PREFIX ?? '!');

    const parsed = parseChoices(raw);

    if (parsed.length < 2) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Need more options', 'danger').setDescription(
            'Give me at least **2** options separated by commas.\n\n> **Uso:** `/choose choices:pizza,sushi,tacos`',
          ),
        ],
      });
      return;
    }

    const picked = randomItem(parsed);

    await ctx.write({
      embeds: [
        createPawsitiveEmbed('Decision made', 'success').setDescription(
          [`Options: ${parsed.map((o) => `\`${o}\``).join(', ')}`, `Picked: **${picked}**`].join(
            '\n',
          ),
        ),
      ],
    });
  }
}
