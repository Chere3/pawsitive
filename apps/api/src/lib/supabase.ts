type SupabaseRequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  query?: Record<string, string>;
  body?: unknown;
  single?: boolean;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

export async function supabaseRequest<T = unknown>(
  table: string,
  options: SupabaseRequestOptions = {},
): Promise<{ data: T | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseServiceRoleKey) {
    return { data: null, error: 'SUPABASE_NOT_CONFIGURED' };
  }

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    'Content-Type': 'application/json',
  };

  if (options.single) {
    headers.Accept = 'application/vnd.pgrst.object+json';
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    return { data: null, error: await response.text() };
  }

  if (response.status === 204) {
    return { data: null, error: null };
  }

  const data = (await response.json()) as T;
  return { data, error: null };
}
