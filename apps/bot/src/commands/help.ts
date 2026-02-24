import {
  Command,
  Declare,
  Options,
  createStringOption,
  type CommandContext,
} from 'seyfert';
import { buildCategoryHelp, buildCommandHelp, buildHelpOverview, findCategory, findCommand } from '../lib/help-center.js';
import { createPawsitiveEmbed } from '../lib/embed-style.js';

const options = {
  category: createStringOption({ description: 'Category to browse', required: false }),
  command: createStringOption({ description: 'Specific command name', required: false }),
};

@Declare({
  name: 'help',
  description: '📘 Browse help by category, command, or pages',
})
@Options(options)
export default class HelpCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const prefix = process.env.BOT_PREFIX ?? '!';

    if (ctx.options.command) {
      const command = findCommand(ctx.options.command);
      if (!command) {
        await ctx.write({
          embeds: [
            createPawsitiveEmbed('Unknown command', 'danger').setDescription([
              `I couldn't find command: **${ctx.options.command}**`,
              '',
              `> **Uso:** \`/help command:<name>\``,
            ].join('\n')),
          ],
        });
        return;
      }

      await ctx.write({ embeds: [buildCommandHelp(command, prefix)] });
      return;
    }

    if (ctx.options.category) {
      const category = findCategory(ctx.options.category);
      if (!category) {
        await ctx.write({
          embeds: [
            createPawsitiveEmbed('Unknown category', 'danger').setDescription([
              `Available: **Core**, **Utility**, **Social**`,
              '',
              `> **Uso:** \`/help category:<name>\``,
            ].join('\n')),
          ],
        });
        return;
      }

      await ctx.write({ embeds: [buildCategoryHelp(category, prefix)] });
      return;
    }

    const page = buildHelpOverview(0, prefix);
    await ctx.write({ embeds: [page.embed], components: page.components });
  }
}
