import { ActionRow, Button, createEvent } from 'seyfert';
import { ButtonStyle } from 'seyfert/lib/types';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import {
  boopLines,
  clapify,
  eightBallAnswers,
  mockCase,
  parseChoices,
  randomItem,
  rollDice,
  shipVerdict,
  uwuify,
  vibeTier,
} from '../lib/fun-tools.js';
import {
  buildCategoryHelp,
  buildCommandHelp,
  buildHelpOverview,
  findCategory,
  findCommand,
} from '../lib/help-center.js';

const PREFIX = process.env.BOT_PREFIX ?? '!';
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'http://localhost:4321';
const INVITE_URL =
  process.env.BOT_INVITE_URL ??
  'https://discord.com/oauth2/authorize?client_id=1475710537332691096&scope=bot%20applications.commands&permissions=274878024704';
const SUPPORT_URL = process.env.BOT_SUPPORT_URL ?? 'https://discord.gg/pawsitive';

function toUser(entity: unknown) {
  const maybe = entity as {
    user?: { id: string; username: string; avatarURL?: (...args: unknown[]) => string | null };
    id?: string;
    username?: string;
    avatarURL?: (...args: unknown[]) => string | null;
  };
  return maybe.user ?? maybe;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

export default createEvent({
  data: { name: 'messageCreate' },
  async run(message, client) {
    if (!message.content?.startsWith(PREFIX)) return;
    if (message.author?.bot) return;

    const [rawName, ...args] = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = (rawName ?? '').toLowerCase();

    if (!command) return;

    switch (command) {
      case 'ping': {
        const gatewayLatency = client.gateway.latency;
        const embed = createPawsitiveEmbed('Ping', 'primary').setDescription(
          [
            `⚡ Gateway: \`${gatewayLatency}ms\``,
            `📊 Uptime: \`${formatUptime(process.uptime())}\``,
            '',
            `> **Uso:** \`${PREFIX}ping\``,
          ].join('\n'),
        );
        await message.reply({ embeds: [embed] });
        break;
      }

      case 'info': {
        const embed = createPawsitiveEmbed('Pawsitive Bot', 'primary')
          .setDescription(
            [
              'Professional furry-themed Discord bot platform.',
              '',
              `> **Uso:** \`${PREFIX}info\``,
            ].join('\n'),
          )
          .addFields([
            {
              name: 'Stats',
              value: `Guilds: ${client.cache.guilds?.count() ?? 0}\nUptime: ${formatUptime(process.uptime())}`,
              inline: true,
            },
            {
              name: 'Quick Commands',
              value: [
                `\`${PREFIX}ping\``,
                `\`${PREFIX}avatar [@user]\``,
                `\`${PREFIX}server\``,
                `\`${PREFIX}boop @user\``,
              ].join('\n'),
              inline: true,
            },
          ]);

        const actions = new ActionRow<Button>().addComponents(
          new Button().setStyle(ButtonStyle.Link).setLabel('Dashboard').setURL(DASHBOARD_URL),
          new Button().setStyle(ButtonStyle.Link).setLabel('Invite').setURL(INVITE_URL),
          new Button().setStyle(ButtonStyle.Link).setLabel('Support').setURL(SUPPORT_URL),
        );

        await message.reply({ embeds: [embed], components: [actions] });
        break;
      }

      case 'avatar': {
        const firstMention = message.mentions?.users?.[0];
        const target = firstMention ? toUser(firstMention) : message.author;
        const avatarUrl =
          target.avatarURL?.({ extension: 'png', size: 4096 }) ??
          `https://cdn.discordapp.com/embed/avatars/${Number(target.id) % 5}.png`;

        const embed = createPawsitiveEmbed(`Avatar — ${target.username}`, 'accent')
          .setImage(avatarUrl)
          .setDescription(
            [`[Open original](${avatarUrl})`, '', `> **Uso:** \`${PREFIX}avatar [@user]\``].join(
              '\n',
            ),
          );

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'server': {
        if (!message.guildId) {
          const embed = createPawsitiveEmbed('Command unavailable', 'danger').setDescription(
            [
              'This command only works inside a server 🐾',
              '',
              `> **Uso:** \`${PREFIX}server\``,
            ].join('\n'),
          );
          await message.reply({ embeds: [embed] });
          return;
        }

        const guild = await message.guild('flow');

        const embed = createPawsitiveEmbed('Server Snapshot', 'success')
          .addFields([
            { name: 'Guild ID', value: `\`${message.guildId}\``, inline: true },
            { name: 'Name', value: `${guild?.name ?? 'Unknown'}`, inline: true },
            { name: 'Features', value: `${guild?.features?.length ?? 0}`, inline: true },
          ])
          .setDescription(`> **Uso:** \`${PREFIX}server\``);

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'boop': {
        const firstMention = message.mentions?.users?.[0];
        if (!firstMention) {
          const embed = createPawsitiveEmbed('Missing argument', 'danger').setDescription(
            [`You need to mention a target user.`, '', `> **Uso:** \`${PREFIX}boop @user\``].join(
              '\n',
            ),
          );
          await message.reply({ embeds: [embed] });
          return;
        }

        const target = toUser(firstMention);
        if (target.id === message.author.id) {
          const embed = createPawsitiveEmbed('Self boop', 'accent').setDescription(
            ['Self-boop unlocked. Cute and valid.', '', `> **Uso:** \`${PREFIX}boop @user\``].join(
              '\n',
            ),
          );
          await message.reply({ embeds: [embed] });
          return;
        }

        const action = randomItem(boopLines);
        const embed = createPawsitiveEmbed('Boop Delivered', 'accent').setDescription(
          [
            `**${message.author.username}** ${action} **${target.username}**`,
            '',
            `> **Uso:** \`${PREFIX}boop @user\``,
          ].join('\n'),
        );

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'coinflip': {
        const outcome = randomItem(['Heads', 'Tails']);
        const embed = createPawsitiveEmbed('Coin Flip', 'accent').setDescription(
          [
            `Result: **${outcome}** ${outcome === 'Heads' ? '🦊' : '🐺'}`,
            '',
            `> **Uso:** \`${PREFIX}coinflip\``,
          ].join('\n'),
        );
        await message.reply({ embeds: [embed] });
        break;
      }

      case 'roll': {
        const sidesRaw = Number.parseInt(args[0] ?? '6', 10);
        const countRaw = Number.parseInt(args[1] ?? '1', 10);
        const sides = Number.isNaN(sidesRaw) ? 6 : Math.max(2, Math.min(100, sidesRaw));
        const count = Number.isNaN(countRaw) ? 1 : Math.max(1, Math.min(10, countRaw));
        const { rolls, total } = rollDice(sides, count);

        const embed = createPawsitiveEmbed('Dice Roll', 'primary').setDescription(
          [
            `Rolled **${count}d${sides}**`,
            `Results: ${rolls.map((n) => `\`${n}\``).join(', ')}`,
            `Total: **${total}**`,
            '',
            `> **Uso:** \`${PREFIX}roll [sides] [count]\``,
          ].join('\n'),
        );

        await message.reply({ embeds: [embed] });
        break;
      }

      case '8ball': {
        const question = args.join(' ').trim();
        if (!question) {
          await message.reply({
            embeds: [
              createPawsitiveEmbed('Missing question', 'danger').setDescription(
                `Usage: \`${PREFIX}8ball <question>\``,
              ),
            ],
          });
          break;
        }

        const answer = randomItem(eightBallAnswers);
        await message.reply({
          embeds: [
            createPawsitiveEmbed('Magic 8-Ball', 'accent').setDescription(
              [`❓ **Question:** ${question}`, `🎱 **Answer:** ${answer}`].join('\n'),
            ),
          ],
        });
        break;
      }

      case 'choose': {
        const parsed = parseChoices(args.join(' '));
        if (parsed.length < 2) {
          await message.reply({
            embeds: [
              createPawsitiveEmbed('Need more options', 'danger').setDescription(
                `Usage: \`${PREFIX}choose pizza,sushi,tacos\``,
              ),
            ],
          });
          break;
        }

        const picked = randomItem(parsed);
        await message.reply({
          embeds: [
            createPawsitiveEmbed('Decision made', 'success').setDescription(
              [
                `Options: ${parsed.map((o) => `\`${o}\``).join(', ')}`,
                `Picked: **${picked}**`,
              ].join('\n'),
            ),
          ],
        });
        break;
      }

      case 'vibecheck': {
        const firstMention = message.mentions?.users?.[0];
        const target = firstMention ? toUser(firstMention) : message.author;
        const score = Math.floor(Math.random() * 101);

        await message.reply({
          embeds: [
            createPawsitiveEmbed('Vibe Check', 'primary').setDescription(
              [
                `Target: **${target.username}**`,
                `Score: **${score}/100**`,
                `Status: ${vibeTier(score)}`,
              ].join('\n'),
            ),
          ],
        });
        break;
      }

      case 'ship': {
        const first = message.mentions?.users?.[0];
        const second = message.mentions?.users?.[1];

        if (!first || !second) {
          await message.reply({
            embeds: [
              createPawsitiveEmbed('Missing users', 'danger').setDescription(
                `Usage: \`${PREFIX}ship @user1 @user2\``,
              ),
            ],
          });
          break;
        }

        const user1 = toUser(first);
        const user2 = toUser(second);
        const score = Math.floor(Math.random() * 101);

        await message.reply({
          embeds: [
            createPawsitiveEmbed('Ship Meter', 'accent').setDescription(
              [
                `Pair: **${user1.username}** × **${user2.username}**`,
                `Compatibility: **${score}%**`,
                `Verdict: ${shipVerdict(score)}`,
              ].join('\n'),
            ),
          ],
        });
        break;
      }

      case 'uwu': {
        const input = args.join(' ').trim();
        if (!input) {
          await message.reply({
            embeds: [
              createPawsitiveEmbed('Missing text', 'danger').setDescription(
                `Usage: \`${PREFIX}uwu <text>\``,
              ),
            ],
          });
          break;
        }

        await message.reply({
          embeds: [
            createPawsitiveEmbed('Uwu Converter', 'accent').setDescription(`**${uwuify(input)}**`),
          ],
        });
        break;
      }

      case 'clap': {
        const input = args.join(' ').trim();
        if (!input) {
          await message.reply({
            embeds: [
              createPawsitiveEmbed('Missing text', 'danger').setDescription(
                `Usage: \`${PREFIX}clap <text>\``,
              ),
            ],
          });
          break;
        }

        await message.reply({
          embeds: [
            createPawsitiveEmbed('Clapifier', 'primary').setDescription(`**${clapify(input)}**`),
          ],
        });
        break;
      }

      case 'mock': {
        const input = args.join(' ').trim();
        if (!input) {
          await message.reply({
            embeds: [
              createPawsitiveEmbed('Missing text', 'danger').setDescription(
                `Usage: \`${PREFIX}mock <text>\``,
              ),
            ],
          });
          break;
        }

        await message.reply({
          embeds: [
            createPawsitiveEmbed('Mock Case', 'accent').setDescription(`**${mockCase(input)}**`),
          ],
        });
        break;
      }

      case 'help': {
        const query = args[0];

        if (query) {
          const asCommand = findCommand(query);
          if (asCommand) {
            await message.reply({ embeds: [buildCommandHelp(asCommand, PREFIX)] });
            break;
          }

          const asCategory = findCategory(query);
          if (asCategory) {
            await message.reply({ embeds: [buildCategoryHelp(asCategory, PREFIX)] });
            break;
          }

          const notFound = createPawsitiveEmbed('Unknown help target', 'danger').setDescription(
            [
              `No command/category found for: **${query}**`,
              '',
              `> **Uso:** \`${PREFIX}help [category|command]\``,
            ].join('\n'),
          );
          await message.reply({ embeds: [notFound] });
          break;
        }

        const page = buildHelpOverview(0, PREFIX);
        const linkRow = new ActionRow<Button>().addComponents(
          new Button().setStyle(ButtonStyle.Link).setLabel('Open Dashboard').setURL(DASHBOARD_URL),
        );

        await message.reply({ embeds: [page.embed], components: [...page.components, linkRow] });
        break;
      }

      default:
        break;
    }
  },
});
