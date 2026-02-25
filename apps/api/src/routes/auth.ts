import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { Elysia } from 'elysia';
import { isSupabaseConfigured, supabaseRequest } from '../lib/supabase.js';

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
const OAUTH_STATE_COOKIE = 'pawsitive_oauth_state';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const OAUTH_STATE_TTL_SECONDS = 60 * 10;

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getDiscordOAuthConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri =
    process.env.DISCORD_REDIRECT_URI ?? 'http://localhost:3000/auth/discord/callback';
  const scope = process.env.DISCORD_SCOPE ?? 'identify guilds';
  const dashboardUrl = process.env.DASHBOARD_URL ?? 'http://localhost:4321';

  return { clientId, clientSecret, redirectUri, scope, dashboardUrl };
}

function getSessionSecret() {
  const secret = process.env.API_SECRET;

  if (!secret && isProduction()) {
    throw new Error(
      'API_SECRET is required in production. Refusing to run with insecure fallback secret.',
    );
  }

  return secret || 'pawsitive-dev-session-secret-change-me';
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

function signToken(payload: object) {
  const encoded = b64url(JSON.stringify(payload));
  const signature = createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken<T>(token?: string): T | null {
  if (!token || !token.includes('.')) return null;

  const [encoded, signature] = token.split('.', 2);
  if (!encoded || !signature) return null;

  const expected = createHmac('sha256', getSessionSecret()).update(encoded).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

  return JSON.parse(unb64url(encoded)) as T;
}

function signSession(payload: SessionPayload) {
  return signToken(payload);
}

function verifySession(token?: string): SessionPayload | null {
  const payload = verifyToken<SessionPayload>(token);
  if (!payload?.exp || Date.now() > payload.exp) return null;
  return payload;
}

type OAuthStatePayload = {
  state: string;
  exp: number;
};

function createOAuthStateCookieValue(state: string) {
  const payload: OAuthStatePayload = {
    state,
    exp: Date.now() + OAUTH_STATE_TTL_SECONDS * 1000,
  };

  return signToken(payload);
}

function verifyOAuthStateCookie(token?: string) {
  const payload = verifyToken<OAuthStatePayload>(token);
  if (!payload?.state || !payload?.exp || Date.now() > payload.exp) return null;
  return payload.state;
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
        return idx === -1
          ? [pair, '']
          : [pair.slice(0, idx), decodeURIComponent(pair.slice(idx + 1))];
      }),
  );
}

function buildCookie(name: string, value: string, maxAgeSeconds: number) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isProduction()) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function clearCookie(name: string) {
  const parts = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];

  if (isProduction()) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function buildAvatarUrl(user: DiscordUser) {
  if (!user.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
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

  const tokenData = (await response.json()) as { access_token: string };
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

  return (await response.json()) as DiscordUser;
}

async function persistSupabaseSession(sessionToken: string, user: DiscordUser) {
  if (!isSupabaseConfigured) return;

  const now = new Date();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  const userRecord = {
    id: user.id,
    discord_id: user.id,
    username: user.username,
    display_name: user.global_name ?? null,
    avatar_hash: user.avatar ?? null,
    updated_at: now.toISOString(),
  };

  const userUpsert = await supabaseRequest('users', {
    method: 'POST',
    query: { on_conflict: 'discord_id' },
    body: userRecord,
  });

  if (userUpsert.error && !userUpsert.error.includes('duplicate')) {
    throw new Error(`Supabase user upsert failed: ${userUpsert.error}`);
  }

  const sessionInsert = await supabaseRequest('sessions', {
    method: 'POST',
    body: {
      id: randomUUID(),
      user_id: user.id,
      token_hash: hashToken(sessionToken),
      expires_at: expiresAt,
      created_at: now.toISOString(),
    },
  });

  if (sessionInsert.error) {
    throw new Error(`Supabase session insert failed: ${sessionInsert.error}`);
  }
}

async function findSupabaseSession(sessionToken: string) {
  if (!isSupabaseConfigured) return null;

  const sessionLookup = await supabaseRequest<{
    user_id: string;
    expires_at: string;
    revoked_at: string | null;
  }>('sessions', {
    query: {
      token_hash: `eq.${hashToken(sessionToken)}`,
      revoked_at: 'is.null',
      select: 'user_id,expires_at,revoked_at',
      limit: '1',
    },
    single: true,
  });

  if (sessionLookup.error || !sessionLookup.data) return null;
  if (new Date(sessionLookup.data.expires_at).getTime() <= Date.now()) return null;

  const userLookup = await supabaseRequest<{
    id: string;
    username: string;
    display_name: string | null;
    avatar_hash: string | null;
  }>('users', {
    query: {
      id: `eq.${sessionLookup.data.user_id}`,
      select: 'id,username,display_name,avatar_hash',
      limit: '1',
    },
    single: true,
  });

  if (userLookup.error || !userLookup.data) return null;

  return {
    id: userLookup.data.id,
    username: userLookup.data.username,
    displayName: userLookup.data.display_name ?? userLookup.data.username,
    avatarHash: userLookup.data.avatar_hash ?? null,
  };
}

async function removeSupabaseSession(sessionToken: string) {
  if (!isSupabaseConfigured) return;

  await supabaseRequest('sessions', {
    method: 'PATCH',
    query: { token_hash: `eq.${hashToken(sessionToken)}` },
    body: { revoked_at: new Date().toISOString() },
  });
}

export const authRouter = new Elysia({ prefix: '/auth' })
  .get('/discord', ({ set, query }) => {
    const cfg = getDiscordOAuthConfig();

    if (!cfg.clientId) {
      set.status = 500;
      return { success: false, error: 'DISCORD_CLIENT_ID is not configured.' };
    }

    const state = typeof query.state === 'string' ? query.state : randomBytes(16).toString('hex');

    const discordUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordUrl.searchParams.set('client_id', cfg.clientId);
    discordUrl.searchParams.set('redirect_uri', cfg.redirectUri);
    discordUrl.searchParams.set('response_type', 'code');
    discordUrl.searchParams.set('scope', cfg.scope);
    discordUrl.searchParams.set('prompt', 'consent');
    discordUrl.searchParams.set('state', state);

    set.headers['Set-Cookie'] = buildCookie(
      OAUTH_STATE_COOKIE,
      createOAuthStateCookieValue(state),
      OAUTH_STATE_TTL_SECONDS,
    );
    set.status = 302;
    set.headers.Location = discordUrl.toString();

    return { success: true, redirectTo: discordUrl.toString() };
  })
  .get('/discord/callback', async ({ query, request, set }) => {
    const cfg = getDiscordOAuthConfig();

    const code = typeof query.code === 'string' ? query.code : undefined;
    const state = typeof query.state === 'string' ? query.state : undefined;
    const error = typeof query.error === 'string' ? query.error : undefined;

    const cookies = parseCookieHeader(request.headers.get('cookie') ?? undefined);
    const stateCookie = cookies[OAUTH_STATE_COOKIE];
    const stateFromCookie = verifyOAuthStateCookie(stateCookie);

    const toLogin = new URL('/login', cfg.dashboardUrl);
    const toDashboard = new URL('/dashboard', cfg.dashboardUrl);

    if (error) {
      toLogin.searchParams.set('error', error);
      if (state) toLogin.searchParams.set('state', state);
      set.status = 302;
      set.headers['Set-Cookie'] = clearCookie(OAUTH_STATE_COOKIE);
      set.headers.Location = toLogin.toString();
      return { success: false, redirectTo: toLogin.toString() };
    }

    if (!state || !stateFromCookie || state !== stateFromCookie) {
      toLogin.searchParams.set('error', 'oauth_state_mismatch');
      set.status = 302;
      set.headers['Set-Cookie'] = clearCookie(OAUTH_STATE_COOKIE);
      set.headers.Location = toLogin.toString();
      return { success: false, redirectTo: toLogin.toString() };
    }

    if (!code || !cfg.clientId || !cfg.clientSecret) {
      toLogin.searchParams.set('error', 'oauth_not_configured');
      if (state) toLogin.searchParams.set('state', state);
      set.status = 302;
      set.headers['Set-Cookie'] = clearCookie(OAUTH_STATE_COOKIE);
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
      await persistSupabaseSession(signed, user);

      set.headers['Set-Cookie'] = buildCookie(SESSION_COOKIE, signed, SESSION_TTL_SECONDS);

      toDashboard.searchParams.set('oauth', 'ok');
      if (state) toDashboard.searchParams.set('state', state);

      set.status = 302;
      set.headers.Location = toDashboard.toString();

      return { success: true, redirectTo: toDashboard.toString() };
    } catch (err) {
      toLogin.searchParams.set('error', 'oauth_exchange_failed');
      if (state) toLogin.searchParams.set('state', state);
      set.status = 302;
      set.headers['Set-Cookie'] = clearCookie(OAUTH_STATE_COOKIE);
      set.headers.Location = toLogin.toString();
      return {
        success: false,
        error: err instanceof Error ? err.message : 'oauth_error',
        redirectTo: toLogin.toString(),
      };
    }
  })
  .get('/me', async ({ request, set }) => {
    const cookies = parseCookieHeader(request.headers.get('cookie') ?? undefined);
    const sessionToken = cookies[SESSION_COOKIE];
    const session = verifySession(sessionToken);

    if (!session || !sessionToken) {
      set.status = 401;
      return { success: false, error: 'Not authenticated' };
    }

    const dbSession = await findSupabaseSession(sessionToken);

    if (!dbSession && isSupabaseConfigured) {
      set.status = 401;
      return { success: false, error: 'Session not found' };
    }

    const userId = dbSession?.id ?? session.sub;
    const username = dbSession?.username ?? session.username;
    const displayName = dbSession?.displayName ?? session.globalName ?? session.username;
    const avatarHash = dbSession?.avatarHash ?? session.avatar ?? null;

    return {
      success: true,
      user: {
        id: userId,
        username,
        displayName,
        avatarUrl: buildAvatarUrl({
          id: userId,
          username,
          global_name: displayName,
          avatar: avatarHash,
        }),
      },
    };
  })
  .post('/logout', async ({ request, set }) => {
    const cookies = parseCookieHeader(request.headers.get('cookie') ?? undefined);
    const sessionToken = cookies[SESSION_COOKIE];

    if (sessionToken) {
      await removeSupabaseSession(sessionToken);
    }

    set.headers['Set-Cookie'] = clearCookie(SESSION_COOKIE);
    return { success: true };
  });
