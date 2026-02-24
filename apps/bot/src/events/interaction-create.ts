import { createEvent } from 'seyfert';
import { buildHelpOverview } from '../lib/help-center.js';

export default createEvent({
  data: { name: 'interactionCreate' },
  async run(interaction) {
    if (!interaction?.isButton?.()) return;

    const id = interaction.customId ?? '';
    if (!id.startsWith('help:page:')) return;

    const pageRaw = Number(id.split(':')[2]);
    const pageIndex = Number.isFinite(pageRaw) ? pageRaw : 0;
    const prefix = process.env.BOT_PREFIX ?? '!';
    const page = buildHelpOverview(pageIndex, prefix);

    try {
      await interaction.update({
        embeds: [page.embed],
        components: page.components,
      });
    } catch {
      // Ignore expired/unknown interactions (Discord 10062)
    }
  },
});
