-- Paid features inside free games, and business/utility apps on the same 1775 login.
--
-- 1) FRACTURE is free to play. Multiplayer, ranked matches and leaderboards are PAID
--    FEATURES, unlocked by a FRACTURE purchase (entitlement), a FRACTURE subscription
--    (game_subscriptions), or a 1775 membership that covers FRACTURE.
-- 2) Business/utility apps (Flight Tracker, After-Hours Lead Kit) use the same 1775 Gaming
--    login but are NOT covered by any game purchase, subscription or membership. Access is
--    provisioned separately, per person, in app_access.

-- ── App kind ───────────────────────────────────────────────────────────────
alter table public.games
  add column if not exists kind text not null default 'game';
do $$ begin
  alter table public.games add constraint games_kind_check check (kind in ('game', 'business'));
exception when duplicate_object then null; end $$;
comment on column public.games.kind is 'game = covered by purchases/subscriptions/memberships; business = provisioned separately via app_access.';

-- ── Paid features inside a game ────────────────────────────────────────────
create table if not exists public.game_features (
  game_id uuid not null references public.games(id) on delete cascade,
  key     text not null,             -- e.g. 'multiplayer'
  name    text not null,             -- shown to players, e.g. 'Online multiplayer'
  paid    boolean not null default true,
  primary key (game_id, key)
);
alter table public.game_features enable row level security;
do $$ begin
  create policy game_features_read on public.game_features for select using (true);
exception when duplicate_object then null; end $$;

-- Has this user paid for this game in any way? (purchase/grant, game subscription, or a
-- membership that covers it). Free entitlements don't count.
create or replace function public.has_paid_access(p_user uuid, p_game uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
      select 1 from public.entitlements e
      where e.user_id = p_user and e.game_id = p_game and e.source <> 'free'
        and (e.expires_at is null or e.expires_at > now()))
    or exists (
      select 1 from public.game_subscriptions gs
      where gs.user_id = p_user and gs.game_id = p_game and gs.status in ('active', 'trialing')
        and (gs.current_period_end is null or gs.current_period_end > now()))
    or exists (
      select 1 from public.games g join public.memberships m on m.user_id = p_user
      where g.id = p_game and g.kind = 'game' and g.tier = 'basic'
        and m.status in ('active', 'trialing') and (m.current_period_end is null or m.current_period_end > now())
        and (m.tier = 'all_access'
             or (m.tier = 'basic' and exists (select 1 from public.membership_selections s
                                              where s.user_id = p_user and s.game_id = p_game))));
$$;
revoke all on function public.has_paid_access(uuid, uuid) from public, anon, authenticated;
grant execute on function public.has_paid_access(uuid, uuid) to service_role;

-- ── Business-app provisioning ──────────────────────────────────────────────
create table if not exists public.app_access (
  user_id    uuid not null references auth.users(id) on delete cascade,
  game_id    uuid not null references public.games(id) on delete cascade,
  role       text not null default 'user',   -- app-defined, e.g. 'admin' / 'client' / 'owner'
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, game_id)
);
alter table public.app_access enable row level security;
-- No client policies: read through account_check().

-- Memberships and game purchases never cover business apps.
create or replace function public.my_access()
returns table(game_id uuid, accessible boolean, reason text)
language sql stable security definer set search_path = public, pg_temp as $$
  select g.id, (t.src <> 'none') as accessible, t.src as reason
  from public.games g
  cross join lateral (
    select case
      when exists (
        select 1 from public.entitlements e
        where e.user_id = auth.uid() and e.game_id = g.id
          and (e.expires_at is null or e.expires_at > now())
      ) then 'owned'
      when g.tier = 'basic' and exists (
        select 1 from public.memberships m
        where m.user_id = auth.uid() and m.status in ('active','trialing') and m.tier = 'all_access'
          and (m.current_period_end is null or m.current_period_end > now())
      ) then 'all_access'
      when g.tier = 'basic' and exists (
        select 1 from public.memberships m
        where m.user_id = auth.uid() and m.status in ('active','trialing') and m.tier = 'basic'
          and (m.current_period_end is null or m.current_period_end > now())
      ) and exists (
        select 1 from public.membership_selections s where s.user_id = auth.uid() and s.game_id = g.id
      ) then 'selected'
      when g.tier = 'premium' and exists (
        select 1 from public.game_subscriptions gs
        where gs.user_id = auth.uid() and gs.game_id = g.id and gs.status in ('active','trialing')
          and (gs.current_period_end is null or gs.current_period_end > now())
      ) then 'premium_sub'
      else 'none'
    end as src
  ) t
  where g.kind = 'game';
$$;

create or replace function public.set_membership_selections(p_games uuid[])
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare m public.memberships; n int;
begin
  select * into m from public.memberships where user_id = auth.uid();
  if m.user_id is null or m.status not in ('active','trialing') then
    raise exception 'no active membership';
  end if;
  if m.tier <> 'basic' then
    raise exception 'game selection is only for the Basic tier';
  end if;
  n := coalesce(array_length(p_games, 1), 0);
  if n > 3 then raise exception 'you can pick at most 3 games'; end if;
  if exists (select 1 from unnest(p_games) g
             where g not in (select id from public.games where tier = 'basic' and kind = 'game')) then
    raise exception 'only basic games can be selected';
  end if;
  if m.selections_updated_at is not null and m.selections_updated_at > now() - interval '30 days' then
    raise exception 'you can change your games once every 30 days (next change after %)',
      (m.selections_updated_at + interval '30 days');
  end if;
  delete from public.membership_selections where user_id = auth.uid();
  insert into public.membership_selections (user_id, game_id) select auth.uid(), g from unnest(p_games) g;
  update public.memberships set selections_updated_at = now(), updated_at = now() where user_id = auth.uid();
end;
$$;

-- ── account_check: adds kind, features, paid_access, app_role, and business provisioning ──
create or replace function public.account_check(p_game text, p_version text default null, p_platform text default null)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  uid      uuid := auth.uid();
  g        public.games;
  admin    boolean;
  acc_ok   boolean;
  acc_why  text;
  has_paid boolean := false;
  feats    jsonb := '{}'::jsonb;
  app_row  public.app_access;
  ban      public.account_actions;
  susp     public.account_actions;
  warns    jsonb;
  min_v    text;
  latest_v text;
  update_url text;
  update_info jsonb;
  base     jsonb;
begin
  if uid is null then
    return jsonb_build_object('allowed', false, 'code', 'not_signed_in', 'message', 'Please sign in to your 1775 Gaming account.');
  end if;

  select * into g from public.games where slug = p_game;
  if g.id is null then
    return jsonb_build_object('allowed', false, 'code', 'unknown_game', 'message', 'This game is not registered with 1775 Gaming.');
  end if;

  admin := public.is_platform_admin(uid);

  select * into ban from public.account_actions a
   where a.user_id = uid and a.kind = 'ban' and a.revoked_at is null
     and a.starts_at <= now() and (a.expires_at is null or a.expires_at > now())
     and (a.game_id is null or a.game_id = g.id)
   order by a.game_id nulls first, a.created_at desc limit 1;
  select * into susp from public.account_actions a
   where a.user_id = uid and a.kind = 'suspension' and a.revoked_at is null
     and a.starts_at <= now() and (a.expires_at is null or a.expires_at > now())
     and (a.game_id is null or a.game_id = g.id)
   order by a.expires_at desc nulls first limit 1;
  select coalesce(jsonb_agg(jsonb_build_object('reason', a.reason, 'at', a.created_at) order by a.created_at desc), '[]'::jsonb)
    into warns from public.account_actions a
   where a.user_id = uid and a.kind = 'warning' and a.revoked_at is null
     and a.created_at > now() - interval '30 days' and (a.game_id is null or a.game_id = g.id);

  min_v    := g.min_version ->> coalesce(p_platform, '');
  latest_v := g.latest_version ->> coalesce(p_platform, '');
  update_url := case p_platform when 'ios' then g.store_url_ios when 'android' then g.store_url_android else g.play_url end;
  update_info := jsonb_build_object(
    'required',    p_version is not null and public.version_lt(p_version, min_v),
    'recommended', p_version is not null and public.version_lt(p_version, latest_v),
    'min_version', min_v, 'latest_version', latest_v, 'url', update_url);

  if g.kind = 'business' then
    -- Business apps: only explicit provisioning counts (never memberships or purchases).
    select * into app_row from public.app_access x
     where x.user_id = uid and x.game_id = g.id and (x.expires_at is null or x.expires_at > now());
    acc_ok := app_row.user_id is not null;
    acc_why := case when acc_ok then 'provisioned' else 'none' end;
  else
    if g.is_free then
      acc_ok := true; acc_why := 'free';
    else
      select ma.accessible, ma.reason into acc_ok, acc_why from public.my_access() ma where ma.game_id = g.id;
    end if;
    has_paid := public.has_paid_access(uid, g.id);
    select coalesce(jsonb_object_agg(f.key, (not f.paid) or has_paid or admin), '{}'::jsonb)
      into feats from public.game_features f where f.game_id = g.id;
  end if;
  acc_ok := coalesce(acc_ok, false);

  base := jsonb_build_object(
    'user_id', uid, 'game', g.slug, 'game_name', g.name, 'kind', g.kind, 'is_admin', admin,
    'access', jsonb_build_object('accessible', acc_ok or admin, 'reason', case when admin and not acc_ok then 'admin' else coalesce(acc_why, 'none') end),
    'paid_access', has_paid or admin,
    'features', feats,
    'app_role', case when g.kind = 'business' then coalesce(app_row.role, case when admin then 'admin' end) end,
    'update', update_info, 'warnings', warns);

  if ban.id is not null then
    return base || jsonb_build_object('allowed', false, 'code', 'banned',
      'message', 'Your account has been banned' || case when ban.game_id is null then '' else ' from ' || g.name end || '. Reason: ' || ban.reason,
      'restriction', jsonb_build_object('kind', 'ban', 'reason', ban.reason, 'expires_at', ban.expires_at, 'all_games', ban.game_id is null));
  end if;
  if susp.id is not null then
    return base || jsonb_build_object('allowed', false, 'code', 'suspended',
      'message', 'Your account is suspended' || coalesce(' until ' || to_char(susp.expires_at at time zone 'UTC', 'Mon DD, YYYY HH24:MI "UTC"'), '') || '. Reason: ' || susp.reason,
      'restriction', jsonb_build_object('kind', 'suspension', 'reason', susp.reason, 'expires_at', susp.expires_at, 'all_games', susp.game_id is null));
  end if;
  if not admin and g.maintenance then
    return base || jsonb_build_object('allowed', false, 'code', 'maintenance',
      'message', coalesce(g.maintenance_message, g.name || ' is down for maintenance. Please try again soon.'));
  end if;
  if not admin and g.status = 'coming_soon' then
    return base || jsonb_build_object('allowed', false, 'code', 'not_released', 'message', g.name || ' is not released yet.');
  end if;
  if (update_info ->> 'required')::boolean then
    return base || jsonb_build_object('allowed', false, 'code', 'update_required',
      'message', 'Please update ' || g.name || ' to version ' || min_v || ' or newer.');
  end if;
  if not (base -> 'access' ->> 'accessible')::boolean then
    if g.kind = 'business' then
      return base || jsonb_build_object('allowed', false, 'code', 'not_provisioned',
        'message', 'Your 1775 Gaming account isn''t set up for ' || g.name || ' yet. Contact support@1775gaming.com to get access.');
    end if;
    return base || jsonb_build_object('allowed', false, 'code', 'no_access',
      'message', case g.tier when 'premium' then g.name || ' needs a subscription.' else g.name || ' needs a 1775 Gaming membership or purchase.' end);
  end if;
  return base || jsonb_build_object('allowed', true, 'code', 'ok', 'message', 'OK');
end $$;

-- ── Admin actions: + grant_app / revoke_app; entitlements only for games ─────
drop function if exists public.platform_admin_action(text, uuid, text, text, timestamptz, text, uuid);
create or replace function public.platform_admin_action(
  p_action text, p_user uuid default null, p_game text default null,
  p_reason text default null, p_expires_at timestamptz default null,
  p_note text default null, p_id uuid default null, p_role text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare gid uuid; gkind text; new_id uuid;
begin
  if not (auth.role() = 'service_role' or public.is_platform_admin()) then
    raise exception 'Forbidden: platform admin required';
  end if;
  if p_game is not null then
    select id, kind into gid, gkind from public.games where slug = p_game;
    if gid is null then raise exception 'Unknown game %', p_game; end if;
  end if;

  case p_action
    when 'warn', 'suspend', 'ban' then
      if p_user is null or coalesce(p_reason, '') = '' then raise exception 'user and reason are required'; end if;
      if p_action = 'suspend' and p_expires_at is null then raise exception 'a suspension needs an end time'; end if;
      insert into public.account_actions (user_id, kind, game_id, reason, internal_note, expires_at, created_by)
      values (p_user, (case p_action when 'warn' then 'warning' when 'suspend' then 'suspension' else 'ban' end)::public.account_action_kind,
              gid, p_reason, p_note, p_expires_at, auth.uid())
      returning id into new_id;
      return jsonb_build_object('ok', true, 'id', new_id);
    when 'revoke_action' then
      update public.account_actions set revoked_at = now(), revoked_by = auth.uid() where id = p_id and revoked_at is null;
      return jsonb_build_object('ok', found);
    when 'grant_entitlement' then
      if p_user is null or gid is null then raise exception 'user and game are required'; end if;
      if gkind = 'business' then raise exception '% is a business app: use grant_app', p_game; end if;
      insert into public.entitlements (user_id, game_id, source, expires_at) values (p_user, gid, 'grant', p_expires_at)
      returning id into new_id;
      return jsonb_build_object('ok', true, 'id', new_id);
    when 'revoke_entitlement' then
      delete from public.entitlements where user_id = p_user and game_id = gid;
      return jsonb_build_object('ok', found);
    when 'grant_app' then
      if p_user is null or gid is null then raise exception 'user and app are required'; end if;
      if gkind <> 'business' then raise exception '% is a game: use grant_entitlement', p_game; end if;
      insert into public.app_access (user_id, game_id, role, granted_by, expires_at)
      values (p_user, gid, coalesce(p_role, 'user'), auth.uid(), p_expires_at)
      on conflict (user_id, game_id) do update set role = excluded.role, expires_at = excluded.expires_at, granted_by = excluded.granted_by, granted_at = now();
      return jsonb_build_object('ok', true);
    when 'revoke_app' then
      delete from public.app_access where user_id = p_user and game_id = gid;
      return jsonb_build_object('ok', found);
    when 'grant_admin' then
      insert into public.platform_admins (user_id, granted_by) values (p_user, auth.uid()) on conflict do nothing;
      return jsonb_build_object('ok', true);
    when 'revoke_admin' then
      delete from public.platform_admins where user_id = p_user;
      return jsonb_build_object('ok', found);
    else
      raise exception 'Unknown action %', p_action;
  end case;
end $$;
revoke all on function public.platform_admin_action(text, uuid, text, text, timestamptz, text, uuid, text) from public, anon;
grant execute on function public.platform_admin_action(text, uuid, text, text, timestamptz, text, uuid, text) to authenticated, service_role;

-- ── Token claims for game servers (Custom Access Token Hook) ────────────────
-- Game backends in OTHER Supabase projects (e.g. FRACTURE) can't query this database, so the
-- unlocked paid features ride inside the player's access token:
--   "a1775_features": { "fracture": ["leaderboards","multiplayer","ranked"] },  "a1775_blocked": false
-- Enable in the dashboard: Authentication → Hooks → Custom Access Token → public.custom_access_token_hook.
-- Tokens refresh about hourly; after a purchase the app should call auth.refreshSession().
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  uid     uuid := (event ->> 'user_id')::uuid;
  claims  jsonb := coalesce(event -> 'claims', '{}'::jsonb);
  admin   boolean := public.is_platform_admin(uid);
  blocked boolean;
  feats   jsonb;
begin
  blocked := exists (select 1 from public.account_actions a
                     where a.user_id = uid and a.kind in ('ban', 'suspension') and a.game_id is null
                       and a.revoked_at is null and a.starts_at <= now()
                       and (a.expires_at is null or a.expires_at > now()));
  select coalesce(jsonb_object_agg(x.slug, x.keys), '{}'::jsonb) into feats
  from (
    select g.slug, jsonb_agg(f.key order by f.key) as keys
    from public.game_features f join public.games g on g.id = f.game_id
    where not blocked and ((not f.paid) or admin or public.has_paid_access(uid, g.id))
    group by g.slug
  ) x;
  claims := jsonb_set(claims, '{a1775_features}', feats);
  claims := jsonb_set(claims, '{a1775_blocked}', to_jsonb(blocked));
  return jsonb_set(event, '{claims}', claims);
end $$;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
-- (SECURITY DEFINER: runs with the owner's rights, so no table grants to supabase_auth_admin are needed.)

-- ── Data ───────────────────────────────────────────────────────────────────
-- FRACTURE: free to play; online play is paid.
update public.games set is_free = true where slug = 'fracture';
insert into public.game_features (game_id, key, name, paid)
select g.id, f.key, f.name, true
from public.games g
cross join (values ('multiplayer', 'Online multiplayer'), ('ranked', 'Ranked matches'), ('leaderboards', 'Leaderboards')) as f(key, name)
where g.slug = 'fracture'
on conflict (game_id, key) do update set name = excluded.name, paid = excluded.paid;

-- Business / utility apps: same 1775 login, provisioned separately.
insert into public.games (slug, name, tagline, platforms, status, tier, is_free, kind, sort) values
  ('flight-tracker', 'Flight Tracker', 'Fare deals and loyalty numbers for clients', '{web}', 'live', 'basic', false, 'business', 900),
  ('leadkit',        'After-Hours Lead Kit', 'After-hours chat, reviews and weekly briefs for home-service businesses', '{web}', 'live', 'basic', false, 'business', 901)
on conflict (slug) do update set kind = 'business', is_free = false;
