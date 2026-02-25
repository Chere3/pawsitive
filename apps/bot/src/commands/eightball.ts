import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { eightBallAnswers, randomItem, textTailFromMessage } from '../lib/fun-tools.js';

const options = {
  question: createStringOption({
    description: 'Ask your question',
    required: false,
    max_length: 200,
  }),
};

@Declare({
  name: '8ball',
  description: '🎱 Ask the magic 8-ball',
})
@Options(options)
export default class EightBallCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const message = (ctx as unknown as { message?: { content?: string } }).message;
    const question =
      ctx.options.question ??
      textTailFromMessage(message?.content, ctx.fullCommandName, process.env.BOT_PREFIX ?? '!');

    if (!question) {
      await ctx.write({
        embeds: [
          createPawsitiveEmbed('Missing question', 'danger').setDescription(
            '> **Uso:** `/8ball question:...` o `!8ball me irá bien?`',
          ),
        ],
      });
      return;
    }

    const answer = randomItem(eightBallAnswers);

    const embed = createPawsitiveEmbed('Magic 8-Ball', 'accent').setDescription(
      [
        `❓ **Question:** ${question}`,
        `🎱 **Answer:** ${answer}`,
        '',
        '> **Uso:** `/8ball question:...`',
      ].join('\n'),
    );

    await ctx.write({ embeds: [embed] });
  }
}
