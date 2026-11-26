-- Applied to the 1775gaming project (Nov 26, 2026).
-- 1) Server-side helper for business apps that invite people (Flight Tracker "Invite client").
create or replace function public.platform_user_id_by_email(p_email text)
returns uuid language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role only'; end if;
  return (select id from auth.users where lower(email) = lower(trim(p_email)) limit 1);
end $$;
revoke all on function public.platform_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.platform_user_id_by_email(text) to service_role;

-- 2) LeadKit: link each business to its owner's 1775 Gaming account.
alter table public.lk_clients add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
create index if not exists lk_clients_owner_user_idx on public.lk_clients (owner_user_id);
