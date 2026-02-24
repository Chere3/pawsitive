import { ActionRow, Button, Embed, createEvent } from 'seyfert';
import { ButtonStyle } from 'seyfert/lib/types';

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

    const [rawName] = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = (rawName ?? '').toLowerCase();

    if (!command) return;

    switch (command) {
      case 'ping': {
        const gatewayLatency = client.gateway.latency;
        const embed = new Embed()
          .setTitle('🏓 Pawsitive • Ping')
          .setColor(0x5865f2)
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
        const embed = new Embed()
          .setTitle('🐾 Pawsitive Bot')
          .setDescription(['Professional furry-themed Discord bot platform.', '', `> **Uso:** \`${PREFIX}info\``].join('\n'))
          .setColor(0x5865f2)
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

        const embed = new Embed()
          .setTitle(`🖼️ Avatar — ${target.username}`)
          .setColor(0xff6bbb)
          .setImage(avatarUrl)
          .setDescription([`[Open original](${avatarUrl})`, '', `> **Uso:** \`${PREFIX}avatar [@user]\``].join('\n'));

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'server': {
        if (!message.guildId) {
          const embed = new Embed()
            .setTitle('⚠️ Command unavailable')
            .setColor(0xed4245)
            .setDescription(['This command only works inside a server 🐾', '', `> **Uso:** \`${PREFIX}server\``].join('\n'));
          await message.reply({ embeds: [embed] });
          return;
        }

        const guild = await message.guild('flow');

        const embed = new Embed()
          .setTitle('🏠 Server Snapshot')
          .setColor(0x43d9bd)
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
          const embed = new Embed()
            .setTitle('⚠️ Missing argument')
            .setColor(0xed4245)
            .setDescription([`You need to mention a target user.`, '', `> **Uso:** \`${PREFIX}boop @user\``].join('\n'));
          await message.reply({ embeds: [embed] });
          return;
        }

        const target = toUser(firstMention);
        if (target.id === message.author.id) {
          const embed = new Embed()
            .setTitle('🐾 Self boop')
            .setColor(0xff6bbb)
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
        const embed = new Embed()
          .setTitle('🐾 Boop Delivered')
          .setColor(0xff6bbb)
          .setDescription([
            `**${message.author.username}** ${action} **${target.username}**`,
            '',
            `> **Uso:** \`${PREFIX}boop @user\``,
          ].join('\n'));

        await message.reply({ embeds: [embed] });
        break;
      }

      case 'help': {
        const embed = new Embed()
          .setTitle('📘 Pawsitive Help')
          .setColor(0x7f6cff)
          .setDescription([
            `• \`${PREFIX}ping\``,
            `• \`${PREFIX}info\``,
            `• \`${PREFIX}avatar [@user]\``,
            `• \`${PREFIX}server\``,
            `• \`${PREFIX}boop @user\``,
            '',
            `> **Uso:** \`${PREFIX}<comando> [args]\``,
          ].join('\n'));

        const actions = new ActionRow<Button>().addComponents(
          new Button().setStyle(ButtonStyle.Link).setLabel('Open Dashboard').setURL(DASHBOARD_URL),
          new Button().setStyle(ButtonStyle.Link).setLabel('Use Slash Commands').setURL('https://discord.com/channels/@me')
        );

        await message.reply({ embeds: [embed], components: [actions] });
        break;
      }

      default:
        break;
    }
  },
});
