-- Harden auth/session table privileges and policies

-- Ensure no broad table grants to client roles
revoke all on table public.users from anon, authenticated;
revoke all on table public.sessions from anon, authenticated;

-- Keep service-role backend access explicit
grant all on table public.users to service_role;
grant all on table public.sessions to service_role;

-- Strengthen policies to explicit operations only
alter table public.users enable row level security;
alter table public.sessions enable row level security;

drop policy if exists users_service_role_all on public.users;
create policy users_service_role_select on public.users
  for select to service_role
  using (true);
create policy users_service_role_insert on public.users
  for insert to service_role
  with check (true);
create policy users_service_role_update on public.users
  for update to service_role
  using (true)
  with check (true);
create policy users_service_role_delete on public.users
  for delete to service_role
  using (true);

drop policy if exists sessions_service_role_all on public.sessions;
create policy sessions_service_role_select on public.sessions
  for select to service_role
  using (true);
create policy sessions_service_role_insert on public.sessions
  for insert to service_role
  with check (true);
create policy sessions_service_role_update on public.sessions
  for update to service_role
  using (true)
  with check (true);
create policy sessions_service_role_delete on public.sessions
  for delete to service_role
  using (true);

-- Data integrity for session lifecycle
alter table public.sessions
  drop constraint if exists sessions_expires_after_created;
alter table public.sessions
  add constraint sessions_expires_after_created
  check (expires_at > created_at);
