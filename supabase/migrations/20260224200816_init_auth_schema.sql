-- Initial auth/session schema for Pawsitive
-- Best practices: timestamptz, explicit FK delete behavior, RLS enabled, indexes

create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  discord_id text not null unique,
  username text not null,
  display_name text,
  avatar_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_username_not_empty check (char_length(trim(username)) > 0)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_expires_at_idx on public.sessions(expires_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.sessions enable row level security;

-- Restrictive by default; only service_role is allowed to manage these tables.
-- (Current app writes/reads using service role key from backend API only.)
drop policy if exists users_service_role_all on public.users;
create policy users_service_role_all
on public.users
for all
to service_role
using (true)
with check (true);

drop policy if exists sessions_service_role_all on public.sessions;
create policy sessions_service_role_all
on public.sessions
for all
to service_role
using (true)
with check (true);
