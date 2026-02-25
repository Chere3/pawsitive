import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const options = {
  question: createStringOption({
    description: 'Ask your question',
    required: true,
    max_length: 200,
  }),
};

const answers = [
  'Yes, absolutely.',
  'Nope.',
  'Ask again later.',
  'It is very likely.',
  'Doubt it.',
  'Signs point to yes.',
  "Can't predict now.",
  'Big yes energy.',
  'Not today.',
];

@Declare({
  name: '8ball',
  description: '🎱 Ask the magic 8-ball',
})
@Options(options)
export default class EightBallCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const answer = answers[Math.floor(Math.random() * answers.length)];

    const embed = createPawsitiveEmbed('Magic 8-Ball', 'accent').setDescription(
      [
        `❓ **Question:** ${ctx.options.question}`,
        `🎱 **Answer:** ${answer}`,
        '',
        '> **Uso:** `/8ball question:...`',
      ].join('\n'),
    );

    await ctx.write({ embeds: [embed] });
  }
}
