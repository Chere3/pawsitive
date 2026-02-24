import { Embed } from 'seyfert/lib/builders';

export type Tone = 'primary' | 'success' | 'danger' | 'accent';

const toneColors: Record<Tone, number> = {
  primary: 0x5865f2,
  success: 0x43d9bd,
  danger: 0xed4245,
  accent: 0xff6bbb,
};

export function createPawsitiveEmbed(title: string, tone: Tone = 'primary') {
  return new Embed()
    .setTitle(`🐾 ${title}`)
    .setColor(toneColors[tone])
    .setFooter({ text: 'Pawsitive • Professional Discord Suite' })
    .setTimestamp();
}
