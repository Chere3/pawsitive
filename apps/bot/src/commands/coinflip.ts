import { Command, type CommandContext, Declare } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const outcomes = ['Heads', 'Tails'];

@Declare({
  name: 'coinflip',
  description: '🪙 Flip a coin',
})
export default class CoinflipCommand extends Command {
  async run(ctx: CommandContext) {
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    const embed = createPawsitiveEmbed('Coin Flip', 'accent').setDescription(
      [
        `Result: **${outcome}** ${outcome === 'Heads' ? '🦊' : '🐺'}`,
        '',
        '> **Uso:** `/coinflip`',
      ].join('\n'),
    );

    await ctx.write({ embeds: [embed] });
  }
}
