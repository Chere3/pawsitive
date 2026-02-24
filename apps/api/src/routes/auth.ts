import { Elysia } from 'elysia';

function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI ?? 'http://localhost:3000/auth/discord/callback';
  const scope = process.env.DISCORD_SCOPE ?? 'identify guilds';

  return {
    clientId,
    redirectUri,
    scope,
  };
}

export const authRouter = new Elysia({ prefix: '/auth' })
  .get('/discord', ({ set, query }) => {
    const { clientId, redirectUri, scope } = getDiscordOAuthConfig();

    if (!clientId) {
      set.status = 500;
      return {
        success: false,
        error:
          'DISCORD_CLIENT_ID is not configured. Add it to apps/api/.env before using Discord login.',
      };
    }

    const state = typeof query.state === 'string' ? query.state : crypto.randomUUID();

    const discordUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordUrl.searchParams.set('client_id', clientId);
    discordUrl.searchParams.set('redirect_uri', redirectUri);
    discordUrl.searchParams.set('response_type', 'code');
    discordUrl.searchParams.set('scope', scope);
    discordUrl.searchParams.set('prompt', 'consent');
    discordUrl.searchParams.set('state', state);

    set.redirect = discordUrl.toString();
    set.status = 302;

    return;
  })
  .get('/discord/callback', ({ query, set }) => {
    const code = typeof query.code === 'string' ? query.code : undefined;
    const state = typeof query.state === 'string' ? query.state : undefined;
    const error = typeof query.error === 'string' ? query.error : undefined;

    if (error) {
      set.status = 400;
      return {
        success: false,
        error,
      };
    }

    if (!code) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing OAuth code',
      };
    }

    return {
      success: true,
      message: 'Discord OAuth callback received. Token exchange is next step.',
      code,
      state,
    };
  });
