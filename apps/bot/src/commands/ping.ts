import { 
  Command, 
  Declare, 
  Options,
  createBooleanOption,
  type CommandContext 
} from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

const options = {
  hide: createBooleanOption({
    description: "Hide the response (ephemeral)",
  }),
};

@Declare({
  name: 'ping',
  description: '🏓 Check bot latency and response time'
})
@Options(options)
export default class PingCommand extends Command {
  async run(ctx: CommandContext<typeof options>) {
    const start = Date.now();
    const flags = ctx.options.hide ? MessageFlags.Ephemeral : undefined;
    
    // Get gateway latency
    const gatewayLatency = ctx.client.gateway.latency;
    
    // Send initial response
    await ctx.write({
      content: '🏓 Pinging...',
      flags,
    });
    
    // Calculate round-trip latency
    const roundTrip = Date.now() - start;
    
    // Edit with full stats
    await ctx.editOrReply({
      content: [
        '🏓 **Pong!**',
        '',
        `⚡ Gateway: \`${gatewayLatency}ms\``,
        `🔄 Round-trip: \`${roundTrip}ms\``,
        `📊 Uptime: \`${formatUptime(process.uptime())}\``,
      ].join('\n'),
      flags,
    });
  }
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
