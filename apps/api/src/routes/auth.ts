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

    set.status = 302;
    set.headers.Location = discordUrl.toString();

    return {
      success: true,
      redirectTo: discordUrl.toString(),
    };
  })
  .get('/discord/callback', ({ query, set }) => {
    const code = typeof query.code === 'string' ? query.code : undefined;
    const state = typeof query.state === 'string' ? query.state : undefined;
    const error = typeof query.error === 'string' ? query.error : undefined;
    const dashboardUrl = process.env.DASHBOARD_URL ?? 'http://localhost:4321';

    if (error) {
      const target = new URL('/login', dashboardUrl);
      target.searchParams.set('error', error);
      if (state) target.searchParams.set('state', state);

      set.status = 302;
      set.headers.Location = target.toString();
      return {
        success: false,
        redirectTo: target.toString(),
      };
    }

    if (!code) {
      const target = new URL('/login', dashboardUrl);
      target.searchParams.set('error', 'missing_code');
      if (state) target.searchParams.set('state', state);

      set.status = 302;
      set.headers.Location = target.toString();
      return {
        success: false,
        redirectTo: target.toString(),
      };
    }

    // TODO: exchange code for access token, create session, then redirect authenticated user
    const target = new URL('/', dashboardUrl);
    target.searchParams.set('oauth', 'discord_connected');
    if (state) target.searchParams.set('state', state);

    set.status = 302;
    set.headers.Location = target.toString();

    return {
      success: true,
      message: 'Discord OAuth callback received. Redirecting to dashboard.',
      redirectTo: target.toString(),
    };
  });
