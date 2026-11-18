-- 0001_platform_accounts.sql
-- 1775 Gaming PLATFORM layer: player accounts, games catalog, entitlements, membership, perks.
--
-- Applies to the WEBSITE Supabase project (NEXT_PUBLIC_SUPABASE_URL) — the central "1775 account".
-- This is the player-facing layer; it is separate from the admin tables (beta_signups, etc.) and
-- from OMNIVERSE's own project (player_profiles, characters, ...).
--
-- NOT YET APPLIED. Review, then run in the Supabase SQL editor or via the CLI (see SETUP_PLATFORM.md).
-- Idempotent and additive — it creates nothing that already exists and touches no existing table.

-- ===========================================================================
-- Players — the "1775 account" (one row per Supabase auth user).
-- Distinct from OMNIVERSE's player_profiles, which live in the Omniverse project.
-- ===========================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- ===========================================================================
-- Games catalog.
-- ===========================================================================
do $$ begin
  create type game_platform as enum ('web','ios','android','desktop');
exception when duplicate_object then null; end $$;

create table if not exists public.games (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  tagline           text,
  platforms         game_platform[] not null default '{}',
  status            text not null default 'live',  -- live | beta | coming_soon
  cover_url         text,
  play_url          text,   -- web games: launch URL
  store_url_ios     text,   -- App Store link
  store_url_android text,   -- Google Play link
  sort              int not null default 0,
  created_at        timestamptz not null default now()
);

-- ===========================================================================
-- Entitlements — what a player has access to, and why.
-- ===========================================================================
do $$ begin
  create type entitlement_source as enum ('purchase','free','membership','grant');
exception when duplicate_object then null; end $$;

create table if not exists public.entitlements (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  game_id    uuid not null references public.games(id) on delete cascade,
  source     entitlement_source not null default 'free',
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, game_id)
);

-- ===========================================================================
-- Membership — the cross-game 1775 subscription. SOURCE-AGNOSTIC on purpose so the same membership
-- can be granted by Stripe (web) OR by App Store / Google Play via RevenueCat (mobile, e.g.
-- OMNIVERSE) — a player who subscribes on one platform gets the perks everywhere.
-- Writes come from billing webhooks (service role); clients only read their own row.
-- ===========================================================================
do $$ begin
  create type membership_status as enum ('none','active','trialing','past_due','canceled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type membership_source as enum ('stripe','apple','google','manual');
exception when duplicate_object then null; end $$;

create table if not exists public.memberships (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  status                   membership_status not null default 'none',
  tier                     text not null default 'founder',
  source                   membership_source,
  current_period_end       timestamptz,
  provider_customer_id     text,   -- Stripe customer id / RevenueCat app user id
  provider_subscription_id text,
  updated_at               timestamptz not null default now()
);

-- ===========================================================================
-- Perks — what a member gets. A perk with game_id = null applies across all games.
-- Games query my_perks() to apply them.
-- ===========================================================================
create table if not exists public.perks (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,   -- machine key a game checks, e.g. 'member_badge'
  name        text not null,
  description text,
  game_id     uuid references public.games(id) on delete cascade,  -- null = all games
  active      boolean not null default true
);

-- A player's currently-active perks (empty unless their membership is active/trialing).
create or replace function public.my_perks()
returns setof public.perks
language sql stable security definer set search_path = public, pg_temp
as $$
  select p.*
  from public.perks p
  where p.active
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.status in ('active','trialing')
        and (m.current_period_end is null or m.current_period_end > now())
    );
$$;

-- ===========================================================================
-- New auth user -> profile row (pulls OAuth name/avatar from Google/Apple metadata).
-- Named *_platform so it never collides with any existing auth trigger in this project.
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  dname text := coalesce(meta->>'full_name', meta->>'name', nullif(split_part(coalesce(new.email,''),'@',1),''), 'Player');
  base  text := lower(regexp_replace(coalesce(meta->>'user_name', meta->>'preferred_username', dname), '[^a-z0-9]', '', 'gi'));
begin
  insert into public.profiles (id, display_name, username, avatar_url)
  values (new.id, dname, nullif(base,'') || '-' || substr(new.id::text,1,4), meta->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_platform on auth.users;
create trigger on_auth_user_created_platform
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- RLS — players read the catalog + their own account/entitlements/membership; billing writes are
-- service-role only (no write policies on entitlements/memberships = default deny for clients).
-- ===========================================================================
alter table public.profiles     enable row level security;
alter table public.games        enable row level security;
alter table public.entitlements enable row level security;
alter table public.memberships  enable row level security;
alter table public.perks        enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public'
             and tablename in ('profiles','games','entitlements','memberships','perks')
  loop execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename); end loop;
end $$;

-- profiles: public read of display data; a player edits only their own row (the trigger inserts it).
create policy profiles_read      on public.profiles     for select using (true);
create policy profiles_self_edit on public.profiles     for update using (auth.uid() = id) with check (auth.uid() = id);

-- catalog + perks: public read.
create policy games_read on public.games for select using (true);
create policy perks_read on public.perks for select using (true);

-- entitlements + membership: a player reads only their own.
create policy entitlements_self on public.entitlements for select using (auth.uid() = user_id);
create policy memberships_self  on public.memberships  for select using (auth.uid() = user_id);

-- ===========================================================================
-- Seed the catalog (edit later via admin). Guarded so re-running is safe.
-- ===========================================================================
insert into public.games (slug, name, tagline, platforms, status, play_url, sort) values
  ('omniverse',  'OMNIVERSE: Ascension', 'AI game-master superhero RPG',        '{ios,android}', 'beta',        null, 1),
  ('fracture',   'FRACTURE',             'Asymmetric four-faction strategy',     '{web}',         'beta',        null, 2),
  ('desolation', 'Desolation',           'AR survival in a world undone',        '{ios,android}', 'coming_soon', null, 3)
on conflict (slug) do nothing;

-- A couple of starter membership perks (cross-game).
insert into public.perks (key, name, description, game_id) values
  ('member_badge',  '1775 Member badge',  'A members-only badge shown on your profile in every game', null),
  ('founder_bonus', 'Founder''s bonus',   'A recurring in-game currency/boost grant for members',     null)
on conflict (key) do nothing;
