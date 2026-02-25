export const eightBallAnswers = [
  'Yes, absolutely.',
  'Nope.',
  'Ask again later.',
  'It is very likely.',
  'Doubt it.',
  'Signs point to yes.',
  "Can't predict now.",
  'Big yes energy.',
  'Not today.',
];

export const boopLines = [
  'gives a playful nose boop 🐾',
  'boops with extra floof energy ✨',
  'delivers an elite boop combo 🎯',
  'boops and runs away dramatically 💨',
];

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

export function parseChoices(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function rollDice(sides = 6, count = 1) {
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const total = rolls.reduce((sum, n) => sum + n, 0);
  return { rolls, total, sides, count };
}

export function vibeTier(score: number): string {
  if (score >= 90) return 'Legendary aura 🌈';
  if (score >= 70) return 'Certified vibe ✅';
  if (score >= 40) return 'Mixed signals 🤨';
  return 'Needs snacks + nap 💤';
}

export function shipVerdict(score: number): string {
  if (score >= 85) return 'Soulbound 🔥';
  if (score >= 65) return 'Strong duo 💖';
  if (score >= 40) return 'Potential arc 📈';
  return 'Friendship route 🌱';
}

export function uwuify(input: string): string {
  return input
    .replace(/[rl]/g, 'w')
    .replace(/[RL]/g, 'W')
    .replace(/n([aeiou])/gi, 'ny$1')
    .replace(/ove/gi, 'uv')
    .replace(/!+/g, ' uwu!');
}

export function clapify(input: string): string {
  return input.split(/\s+/).filter(Boolean).join(' 👏 ');
}

export function mockCase(input: string): string {
  return input
    .split('')
    .map((ch, i) => (i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase()))
    .join('');
}

export function textTailFromMessage(
  content: string | undefined,
  fullCommandName: string,
  prefix = '!',
): string {
  if (!content || !fullCommandName) return '';

  const normalized = content.trim();
  const head = `${prefix}${fullCommandName}`.toLowerCase();

  if (!normalized.toLowerCase().startsWith(head)) return '';

  return normalized.slice(head.length).trim();
}

type TextMessageShape = {
  content?: string;
  mentions?: Array<{ id: string; username: string }>;
};

type TextCtxShape = {
  message?: TextMessageShape;
  fullCommandName?: string;
  options?: Record<string, unknown>;
};

export function getTextMessage(ctx: unknown): TextMessageShape | undefined {
  return (ctx as TextCtxShape).message;
}

export function getTextMentions(ctx: unknown): Array<{ id: string; username: string }> {
  return getTextMessage(ctx)?.mentions ?? [];
}

export function resolveStringInput(
  ctx: unknown,
  optionName: string,
  prefix = '!',
): string | undefined {
  const typed = ctx as TextCtxShape;
  const direct = typed.options?.[optionName];

  if (typeof direct === 'string' && direct.trim().length > 0) {
    return direct.trim();
  }

  const tail = textTailFromMessage(typed.message?.content, typed.fullCommandName ?? '', prefix);
  return tail || undefined;
}
