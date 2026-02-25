import { ActionRow, Button } from 'seyfert/lib/builders';
import { ButtonStyle } from 'seyfert/lib/types';
import { createPawsitiveEmbed } from './embed-style.js';

export type HelpCommandDoc = {
  name: string;
  description: string;
  usage: string;
  category: string;
};

export const COMMAND_DOCS: HelpCommandDoc[] = [
  {
    name: 'ping',
    description: 'Check gateway and response latency.',
    usage: '/ping [hide:true|false] | !ping',
    category: 'Core',
  },
  {
    name: 'info',
    description: 'Platform overview, links and quick actions.',
    usage: '/info | !info',
    category: 'Core',
  },
  {
    name: 'help',
    description: 'Browse command help by category or command.',
    usage: '/help [category] [command] | !help [category|command]',
    category: 'Core',
  },
  {
    name: 'avatar',
    description: 'Show a user avatar in high quality.',
    usage: '/avatar [user] | !avatar [@user]',
    category: 'Utility',
  },
  {
    name: 'server',
    description: 'Show current server snapshot.',
    usage: '/server | !server',
    category: 'Utility',
  },
  {
    name: 'boop',
    description: 'Playful social interaction command.',
    usage: '/boop user:@someone | !boop @user',
    category: 'Social',
  },
  {
    name: 'coinflip',
    description: 'Flip a coin.',
    usage: '/coinflip',
    category: 'Fun',
  },
  {
    name: 'roll',
    description: 'Roll one or multiple dice.',
    usage: '/roll [sides] [count]',
    category: 'Fun',
  },
  {
    name: '8ball',
    description: 'Ask the magic 8-ball a question.',
    usage: '/8ball question:...',
    category: 'Fun',
  },
  {
    name: 'choose',
    description: 'Pick one option from a list.',
    usage: '/choose choices:option1,option2',
    category: 'Fun',
  },
  {
    name: 'vibecheck',
    description: 'Random vibe score for a user.',
    usage: '/vibecheck [user]',
    category: 'Fun',
  },
  {
    name: 'ship',
    description: 'Chaotic compatibility meter.',
    usage: '/ship user1:@a user2:@b',
    category: 'Fun',
  },
  {
    name: 'uwu',
    description: 'Convert text to uwu mode.',
    usage: '/uwu text:...',
    category: 'Fun',
  },
  {
    name: 'clap',
    description: 'Insert dramatic clap spacing.',
    usage: '/clap text:...',
    category: 'Fun',
  },
  {
    name: 'mock',
    description: 'Convert text to mock case.',
    usage: '/mock text:...',
    category: 'Fun',
  },
];

export const CATEGORIES = Array.from(new Set(COMMAND_DOCS.map((c) => c.category)));

export function normalize(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

export function findCategory(input?: string) {
  const key = normalize(input);
  return CATEGORIES.find((c) => c.toLowerCase() === key);
}

export function findCommand(input?: string) {
  const key = normalize(input).replace(/^[/!]/, '');
  return COMMAND_DOCS.find((c) => c.name.toLowerCase() === key);
}

export function buildHelpOverview(page: number, prefix: string) {
  const max = CATEGORIES.length;
  const safePage = Math.max(0, Math.min(page, max - 1));
  const category = CATEGORIES[safePage] ?? CATEGORIES[0] ?? 'Core';
  const commands = COMMAND_DOCS.filter((c) => c.category === category);

  const embed = createPawsitiveEmbed(`Help Center • ${category}`, 'primary').setDescription(
    [
      `Category **${safePage + 1}/${max}**`,
      '',
      ...commands.map((c) => `• **${c.name}** — ${c.description}`),
      '',
      `> **Uso:** \`${prefix}help [category|command]\``,
    ].join('\n'),
  );

  const actions = new ActionRow<Button>().addComponents(
    new Button()
      .setCustomId(`help:page:${Math.max(0, safePage - 1)}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel('◀ Prev')
      .setDisabled(safePage === 0),
    new Button()
      .setCustomId(`help:page:${Math.min(max - 1, safePage + 1)}`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Next ▶')
      .setDisabled(safePage === max - 1),
  );

  return { embed, components: [actions], page: safePage, total: max };
}

export function buildCategoryHelp(category: string, prefix: string) {
  const commands = COMMAND_DOCS.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  return createPawsitiveEmbed(`Help • ${category}`, 'primary').setDescription(
    [
      ...commands.map((c) => `• **${c.name}**\n  ${c.description}\n  > **Uso:** \`${c.usage}\``),
      '',
      `> **Uso:** \`${prefix}help ${category.toLowerCase()}\``,
    ].join('\n'),
  );
}

export function buildCommandHelp(command: HelpCommandDoc, prefix: string) {
  return createPawsitiveEmbed(`Help • ${command.name}`, 'primary').setDescription(
    [
      command.description,
      '',
      `Category: **${command.category}**`,
      `> **Uso:** \`${command.usage}\``,
      '',
      `Tip: \`${prefix}help ${command.category.toLowerCase()}\` to browse its category.`,
    ].join('\n'),
  );
}
