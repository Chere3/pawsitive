import { Command, type CommandContext, createStringOption, Declare, Options } from 'seyfert';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const options = {
  text: createStringOption({
    description: 'Text to clapify',
    required: true,
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
    const output = ctx.options.text.split(/\s+/).filter(Boolean).join(' 👏 ');

    await ctx.write({
      embeds: [createPawsitiveEmbed('Clapifier', 'primary').setDescription(`**${output}**`)],
    });
  }
}
