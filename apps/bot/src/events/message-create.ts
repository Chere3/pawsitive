import { ActionRow, Button, createEvent } from 'seyfert';
import { ButtonStyle } from 'seyfert/lib/types';
import { createPawsitiveEmbed } from '../lib/embed-style.js';
import { buildCategoryHelp, buildCommandHelp, buildHelpOverview, findCategory, findCommand } from '../lib/help-center.js';

const PREFIX = process.env.BOT_PREFIX ?? '!';
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'http://localhost:4321';
const INVITE_URL = process.env.BOT_INVITE_URL ?? 'https://discord.com/oauth2/authorize?client_id=1475710537332691096&scope=bot%20applications.commands&permissions=274878024704';
const SUPPORT_URL = process.env.BOT_SUPPORT_URL ?? 'https://discord.gg/pawsitive';

function toUser(entity: unknown) {
  const maybe = entity as { user?: { id: string; username: string; avatarURL?: (...args: any[]) => string | null }; id?: string; username?: string; avatarURL?: (...args: any[]) => string | null };
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
        const embed = createPawsitiveEmbed('Ping', 'primary')
          .setDescription([
            `⚡ Gateway: \`${gatewayLatency}ms\``,
            `📊 Uptime: \`${formatUptime(process.uptime())}\``,
            '',
            `> **Uso:** \`${PREFIX}ping\``,
          ].join('\n'));
        await message.reply({ embeds: [embed] });
        break;
      }

      case 'info': {
        const embed = createPawsitiveEmbed('Pawsitive Bot', 'primary')
          .setDescription(['Professional furry-themed Discord bot platform.', '', `> **Uso:** \`${PREFIX}info\``].join('\n'))
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
          new Button().setStyle(ButtonStyle.Link).setLabel('Support').setURL(SUPPORT_URL)
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
          .setDescription([`[Open original](${avatarUrl})`, '', `> **Uso:** \`${PREFIX}avatar [@user]\``].join('\n'));

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'server': {
        if (!message.guildId) {
          const embed = createPawsitiveEmbed('Command unavailable', 'danger')
            .setDescription(['This command only works inside a server 🐾', '', `> **Uso:** \`${PREFIX}server\``].join('\n'));
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
          const embed = createPawsitiveEmbed('Missing argument', 'danger')
            .setDescription([`You need to mention a target user.`, '', `> **Uso:** \`${PREFIX}boop @user\``].join('\n'));
          await message.reply({ embeds: [embed] });
          return;
        }

        const target = toUser(firstMention);
        if (target.id === message.author.id) {
          const embed = createPawsitiveEmbed('Self boop', 'accent')
            .setDescription(['Self-boop unlocked. Cute and valid.', '', `> **Uso:** \`${PREFIX}boop @user\``].join('\n'));
          await message.reply({ embeds: [embed] });
          return;
        }

        const lines = [
          'gives a playful nose boop 🐾',
          'boops with extra floof energy ✨',
          'delivers an elite boop combo 🎯',
          'boops and runs away dramatically 💨',
        ];
        const action = lines[Math.floor(Math.random() * lines.length)];
        const embed = createPawsitiveEmbed('Boop Delivered', 'accent')
          .setDescription([
            `**${message.author.username}** ${action} **${target.username}**`,
            '',
            `> **Uso:** \`${PREFIX}boop @user\``,
          ].join('\n'));

        await message.reply({ embeds: [embed] });
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

          const notFound = createPawsitiveEmbed('Unknown help target', 'danger').setDescription([
            `No command/category found for: **${query}**`,
            '',
            `> **Uso:** \`${PREFIX}help [category|command]\``,
          ].join('\n'));
          await message.reply({ embeds: [notFound] });
          break;
        }

        const page = buildHelpOverview(0, PREFIX);
        const linkRow = new ActionRow<Button>().addComponents(
          new Button().setStyle(ButtonStyle.Link).setLabel('Open Dashboard').setURL(DASHBOARD_URL)
        );

        await message.reply({ embeds: [page.embed], components: [...page.components, linkRow] });
        break;
      }

      default:
        break;
    }
  },
});
