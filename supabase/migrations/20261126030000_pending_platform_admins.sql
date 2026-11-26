-- Applied to the 1775gaming project (Nov 26, 2026).
-- Pre-approve platform admins by email before they have a 1775 Gaming account. They become
-- admins only once the account exists AND the email is verified (confirmation link, or
-- Google/Apple sign-in, which verify the address).
create table if not exists public.pending_platform_admins (
  email      text primary key check (email = lower(email)),
  added_at   timestamptz not null default now(),
  note       text
);
alter table public.pending_platform_admins enable row level security;

create or replace function public.promote_pending_platform_admin()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.email is not null and new.email_confirmed_at is not null
     and exists (select 1 from public.pending_platform_admins where email = lower(new.email)) then
    insert into public.platform_admins (user_id) values (new.id) on conflict do nothing;
    delete from public.pending_platform_admins where email = lower(new.email);
  end if;
  return new;
end $$;
revoke all on function public.promote_pending_platform_admin() from public, anon, authenticated;

drop trigger if exists on_auth_user_promote_admin on auth.users;
create trigger on_auth_user_promote_admin
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.promote_pending_platform_admin();

insert into public.pending_platform_admins (email, note)
values ('legal@1775gaming.com', 'Owner-requested platform admin (Nov 26, 2026)')
on conflict (email) do nothing;
