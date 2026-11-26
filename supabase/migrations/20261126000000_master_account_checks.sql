-- 1775 Gaming master account: one login for every game/app, plus the checks every
-- game runs at sign-in: app version, entitlement/subscription, adverse actions
-- (warnings, suspensions, bans) and maintenance mode.
--
-- Every game/app calls:   select account_check('<game-slug>', '<app version>', '<ios|android|web|desktop>');
-- and refuses to continue unless the result has "allowed": true.
-- Servers that trust platform tokens should run the same check (clients can be tampered with).

-- ── Per-game release rules ────────────────────────────────────────────────
alter table public.games
  add column if not exists is_free boolean not null default false,          -- free to play with any 1775 account
  add column if not exists min_version jsonb not null default '{}'::jsonb,  -- {"ios":"1.2.0","android":"1.2.0","web":"1.0.0"} → older builds must update
  add column if not exists latest_version jsonb not null default '{}'::jsonb, -- newer than this build → "update available" (not forced)
  add column if not exists maintenance boolean not null default false,
  add column if not exists maintenance_message text;

comment on column public.games.is_free is 'Free with any signed-in 1775 Gaming account (no membership/entitlement needed).';
comment on column public.games.min_version is 'Per-platform minimum app version, e.g. {"ios":"1.2.0","web":"1.0.0"}. Older versions are blocked with update_required.';

-- ── Platform admins (can bypass access checks and run admin actions) ───────
create table if not exists public.platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);
alter table public.platform_admins enable row level security;
-- No policies: only SECURITY DEFINER functions and the service role can read/write it.

create or replace function public.is_platform_admin(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.platform_admins where user_id = p_user);
$$;

-- ── Adverse actions (warnings, suspensions, bans) ─────────────────────────
do $$ begin
  create type public.account_action_kind as enum ('warning', 'suspension', 'ban');
exception when duplicate_object then null; end $$;

create table if not exists public.account_actions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          public.account_action_kind not null,
  game_id       uuid references public.games(id) on delete cascade,  -- null = applies to ALL games
  reason        text not null,           -- shown to the player
  internal_note text,                    -- staff only, never returned to clients
  starts_at     timestamptz not null default now(),
  expires_at    timestamptz,             -- null = permanent
  revoked_at    timestamptz,
  revoked_by    uuid references auth.users(id) on delete set null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists account_actions_user_idx on public.account_actions (user_id) where revoked_at is null;
alter table public.account_actions enable row level security;
-- No client policies: players see their restrictions only through account_check().

-- ── Version comparison: "1.10.0" > "1.9.3"; non-numeric parts ignored ──────
create or replace function public.version_lt(a text, b text)
returns boolean language plpgsql immutable as $$
declare pa int[]; pb int[]; i int;
begin
  if a is null or b is null or a = '' or b = '' then return false; end if;
  pa := array(select coalesce(nullif(regexp_replace(x, '\D', '', 'g'), ''), '0')::int from unnest(string_to_array(split_part(a, '-', 1), '.')) x);
  pb := array(select coalesce(nullif(regexp_replace(x, '\D', '', 'g'), ''), '0')::int from unnest(string_to_array(split_part(b, '-', 1), '.')) x);
  for i in 1 .. greatest(array_length(pa, 1), array_length(pb, 1)) loop
    if coalesce(pa[i], 0) < coalesce(pb[i], 0) then return true; end if;
    if coalesce(pa[i], 0) > coalesce(pb[i], 0) then return false; end if;
  end loop;
  return false;
end $$;

-- ── The one check every game/app runs after sign-in ───────────────────────
create or replace function public.account_check(p_game text, p_version text default null, p_platform text default null)
returns jsonb
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  uid      uuid := auth.uid();
  g        public.games;
  admin    boolean;
  acc_ok   boolean;
  acc_why  text;
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

  -- Adverse actions: bans first, then suspensions (global or for this game).
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

  -- Versions
  min_v    := g.min_version ->> coalesce(p_platform, '');
  latest_v := g.latest_version ->> coalesce(p_platform, '');
  update_url := case p_platform when 'ios' then g.store_url_ios when 'android' then g.store_url_android else g.play_url end;
  update_info := jsonb_build_object(
    'required',    p_version is not null and public.version_lt(p_version, min_v),
    'recommended', p_version is not null and public.version_lt(p_version, latest_v),
    'min_version', min_v, 'latest_version', latest_v, 'url', update_url);

  -- Access (free game, or entitlement / membership / subscription via my_access())
  if g.is_free then
    acc_ok := true; acc_why := 'free';
  else
    select ma.accessible, ma.reason into acc_ok, acc_why from public.my_access() ma where ma.game_id = g.id;
  end if;
  acc_ok := coalesce(acc_ok, false);

  base := jsonb_build_object(
    'user_id', uid, 'game', g.slug, 'game_name', g.name, 'is_admin', admin,
    'access', jsonb_build_object('accessible', acc_ok or admin, 'reason', case when admin and not acc_ok then 'admin' else coalesce(acc_why, 'none') end),
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
    return base || jsonb_build_object('allowed', false, 'code', 'no_access',
      'message', case g.tier when 'premium' then g.name || ' needs a subscription.' else g.name || ' needs a 1775 Gaming membership or purchase.' end);
  end if;
  return base || jsonb_build_object('allowed', true, 'code', 'ok', 'message', 'OK');
end $$;

revoke all on function public.account_check(text, text, text) from public, anon;
grant execute on function public.account_check(text, text, text) to authenticated, service_role;

-- Server-side variant for trusted backends (service role): check any user.
create or replace function public.account_check_for(p_user uuid, p_game text, p_version text default null, p_platform text default null)
returns jsonb language plpgsql volatile security definer set search_path = public, pg_temp as $$
begin
  if auth.role() <> 'service_role' then raise exception 'service role only'; end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  return public.account_check(p_game, p_version, p_platform);
end $$;
revoke all on function public.account_check_for(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.account_check_for(uuid, text, text, text) to service_role;

-- ── Admin actions (service role or platform admin) ────────────────────────
create or replace function public.platform_admin_action(
  p_action text, p_user uuid default null, p_game text default null,
  p_reason text default null, p_expires_at timestamptz default null,
  p_note text default null, p_id uuid default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare gid uuid; new_id uuid;
begin
  if not (auth.role() = 'service_role' or public.is_platform_admin()) then
    raise exception 'Forbidden: platform admin required';
  end if;
  if p_game is not null then
    select id into gid from public.games where slug = p_game;
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
      insert into public.entitlements (user_id, game_id, source, expires_at) values (p_user, gid, 'grant', p_expires_at)
      returning id into new_id;
      return jsonb_build_object('ok', true, 'id', new_id);
    when 'revoke_entitlement' then
      delete from public.entitlements where user_id = p_user and game_id = gid;
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
revoke all on function public.platform_admin_action(text, uuid, text, text, timestamptz, text, uuid) from public, anon;
grant execute on function public.platform_admin_action(text, uuid, text, text, timestamptz, text, uuid) to authenticated, service_role;

-- ── Register every current game/app ───────────────────────────────────────
insert into public.games (slug, name, tagline, platforms, status, tier, is_free, sort) values
  ('hear-translate',   'Hear & Translate', 'Live English captions for hearing aid users', '{web,ios,android}', 'beta', 'basic', true, 40),
  ('gravity-breakout', 'Gravity Breakout', null, '{web}', 'live', 'basic', true, 50),
  ('drop-merge',       'Drop Merge',       null, '{web}', 'live', 'basic', true, 51),
  ('portal-snake',     'Portal Snake',     null, '{web}', 'live', 'basic', true, 52),
  ('memory-grid',      'Memory Grid',      null, '{web}', 'live', 'basic', true, 53),
  ('gravity-flip',     'Gravity Flip',     null, '{web}', 'live', 'basic', true, 54),
  ('invasion-defense', 'Invasion Defense', null, '{android,ios}', 'beta', 'basic', true, 55)
on conflict (slug) do nothing;

-- Hardening (applied as a second migration): don't let clients probe who is an admin.
revoke all on function public.is_platform_admin(uuid) from public, anon, authenticated;
grant execute on function public.is_platform_admin(uuid) to service_role;
alter function public.version_lt(text, text) set search_path = public, pg_temp;

-- Omniverse is free to play ("Tier 0 is free forever"); paid tiers live inside the game.
-- Without this, account_check would block every player who has no platform subscription.
update public.games set is_free = true where slug = 'omniverse';
