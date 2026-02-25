import { Command, type CommandContext, createIntegerOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { rollDice } from '../lib/fun-tools.js';

const options = {
  sides: createIntegerOption({
    description: 'Dice sides (default 6)',
    min_value: 2,
    max_value: 100,
    required: false,
  }),
  count: createIntegerOption({
    description: 'How many dice (default 1)',
    min_value: 1,
    max_value: 10,
    required: false,
  }),
};

@Declare({
  name: 'roll',
  description: '🎲 Roll one or multiple dice',
})
@Options(options)
export default class RollCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const { rolls, total, sides, count } = rollDice(ctx.options.sides ?? 6, ctx.options.count ?? 1);

    const embed = createPawsitiveEmbed('Dice Roll', 'primary').setDescription(
      [
        `Rolled **${count}d${sides}**`,
        `Results: ${rolls.map((n) => `\`${n}\``).join(', ')}`,
        `Total: **${total}**`,
        '',
        '> **Uso:** `/roll sides:20 count:2`',
      ].join('\n'),
    );

    await ctx.write({ embeds: [embed] });
  }
}
