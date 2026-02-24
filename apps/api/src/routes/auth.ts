import { Elysia } from 'elysia';
import { createHmac, timingSafeEqual } from 'node:crypto';

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
};

type SessionPayload = {
  sub: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
  exp: number;
};

const SESSION_COOKIE = 'pawsitive_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? 'http://localhost:3000/auth/discord/callback';
  const scope = process.env.DISCORD_SCOPE ?? 'identify guilds';
  const dashboardUrl = process.env.DASHBOARD_URL ?? 'http://localhost:4321';

  return { clientId, clientSecret, redirectUri, scope, dashboardUrl };
}

function getSessionSecret() {
  return process.env.API_SECRET || 'pawsitive-dev-session-secret-change-me';
}

function b64url(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function unb64url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64').toString('utf8');
}

function signSession(payload: SessionPayload) {
  const encoded = b64url(JSON.stringify(payload));
  const signature = createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySession(token?: string): SessionPayload | null {
  if (!token || !token.includes('.')) return null;

  const [encoded, signature] = token.split('.', 2);
  if (!encoded || !signature) return null;

  const expected = createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

  const payload = JSON.parse(unb64url(encoded)) as SessionPayload;
  if (!payload.exp || Date.now() > payload.exp) return null;

  return payload;
}

function parseCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) return {} as Record<string, string>;
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.indexOf('=');
        return idx === -1 ? [pair, ''] : [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
      })
  );
}

function buildAvatarUrl(user: DiscordUser) {
  if (!user.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
}

async function exchangeCodeForToken(code: string, cfg: ReturnType<typeof getDiscordOAuthConfig>) {
  const body = new URLSearchParams({
    client_id: cfg.clientId!,
    client_secret: cfg.clientSecret!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: cfg.redirectUri,
  });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed token exchange (${response.status}): ${details}`);
  }

  const tokenData = await response.json() as { access_token: string };
  return tokenData.access_token;
}

async function fetchDiscordUser(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Failed user profile fetch (${response.status}): ${details}`);
  }

  return await response.json() as DiscordUser;
}

export const authRouter = new Elysia({ prefix: '/auth' })
  .get('/discord', ({ set, query }) => {
    const cfg = getDiscordOAuthConfig();

    if (!cfg.clientId) {
      set.status = 500;
      return { success: false, error: 'DISCORD_CLIENT_ID is not configured.' };
    }

    const state = typeof query.state === 'string' ? query.state : crypto.randomUUID();

    const discordUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordUrl.searchParams.set('client_id', cfg.clientId);
    discordUrl.searchParams.set('redirect_uri', cfg.redirectUri);
    discordUrl.searchParams.set('response_type', 'code');
    discordUrl.searchParams.set('scope', cfg.scope);
    discordUrl.searchParams.set('prompt', 'consent');
    discordUrl.searchParams.set('state', state);

    set.status = 302;
    set.headers.Location = discordUrl.toString();

    return { success: true, redirectTo: discordUrl.toString() };
  })
  .get('/discord/callback', async ({ query, set }) => {
    const cfg = getDiscordOAuthConfig();

    const code = typeof query.code === 'string' ? query.code : undefined;
    const state = typeof query.state === 'string' ? query.state : undefined;
    const error = typeof query.error === 'string' ? query.error : undefined;

    const toLogin = new URL('/login', cfg.dashboardUrl);
    const toDashboard = new URL('/dashboard', cfg.dashboardUrl);

    if (error) {
      toLogin.searchParams.set('error', error);
      if (state) toLogin.searchParams.set('state', state);
      set.status = 302;
      set.headers.Location = toLogin.toString();
      return { success: false, redirectTo: toLogin.toString() };
    }

    if (!code || !cfg.clientId || !cfg.clientSecret) {
      toLogin.searchParams.set('error', 'oauth_not_configured');
      if (state) toLogin.searchParams.set('state', state);
      set.status = 302;
      set.headers.Location = toLogin.toString();
      return { success: false, redirectTo: toLogin.toString() };
    }

    try {
      const accessToken = await exchangeCodeForToken(code, cfg);
      const user = await fetchDiscordUser(accessToken);

      const payload: SessionPayload = {
        sub: user.id,
        username: user.username,
        globalName: user.global_name ?? null,
        avatar: user.avatar ?? null,
        exp: Date.now() + SESSION_TTL_SECONDS * 1000,
      };

      const signed = signSession(payload);
      const cookie = `${SESSION_COOKIE}=${encodeURIComponent(signed)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
      set.headers['Set-Cookie'] = cookie;

      toDashboard.searchParams.set('oauth', 'ok');
      if (state) toDashboard.searchParams.set('state', state);

      set.status = 302;
      set.headers.Location = toDashboard.toString();

      return { success: true, redirectTo: toDashboard.toString() };
    } catch (err) {
      toLogin.searchParams.set('error', 'oauth_exchange_failed');
      if (state) toLogin.searchParams.set('state', state);
      set.status = 302;
      set.headers.Location = toLogin.toString();
      return {
        success: false,
        error: err instanceof Error ? err.message : 'oauth_error',
        redirectTo: toLogin.toString(),
      };
    }
  })
  .get('/me', ({ request, set }) => {
    const cookies = parseCookieHeader(request.headers.get('cookie') ?? undefined);
    const session = verifySession(cookies[SESSION_COOKIE]);

    if (!session) {
      set.status = 401;
      return { success: false, error: 'Not authenticated' };
    }

    return {
      success: true,
      user: {
        id: session.sub,
        username: session.username,
        displayName: session.globalName || session.username,
        avatarUrl: buildAvatarUrl({
          id: session.sub,
          username: session.username,
          global_name: session.globalName,
          avatar: session.avatar,
        }),
      },
    };
  })
  .post('/logout', ({ set }) => {
    set.headers['Set-Cookie'] = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
    return { success: true };
  });
