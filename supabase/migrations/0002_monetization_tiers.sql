-- 0002_monetization_tiers.sql
-- Tiered monetization model (see MONETIZATION_MODEL.md). Applies to the WEBSITE Supabase project.
-- Additive + idempotent. NOT YET APPLIED — review, then run after 0001.

-- ===========================================================================
-- Game classes: basic (in the membership) vs premium (own subscription).
-- ===========================================================================
do $$ begin create type game_tier as enum ('basic','premium'); exception when duplicate_object then null; end $$;

alter table public.games add column if not exists tier game_tier not null default 'basic';
alter table public.games add column if not exists member_discount_pct int not null default 0; -- % off in-game buys for members

update public.games set tier = 'premium' where slug in ('omniverse','desolation');
update public.games set tier = 'basic'   where slug in ('fracture');

-- ===========================================================================
-- Membership tiers: 'basic' ($4.99 — pick 3 basic games) | 'all_access' ($9.99 — all basic games).
-- (memberships.tier was created in 0001 as text; we just reuse it with these values.)
-- ===========================================================================
alter table public.memberships alter column tier set default 'basic';
alter table public.memberships add column if not exists selections_updated_at timestamptz; -- for the 30-day lock

-- Basic tier's chosen games (the "pick 3").
create table if not exists public.membership_selections (
  user_id     uuid not null references auth.users(id) on delete cascade,
  game_id     uuid not null references public.games(id) on delete cascade,
  selected_at timestamptz not null default now(),
  primary key (user_id, game_id)
);
alter table public.membership_selections enable row level security;
drop policy if exists msel_self on public.membership_selections;
create policy msel_self on public.membership_selections for select using (auth.uid() = user_id);

-- Replace the player's selected games (Basic tier only): <= 3 basic games, once per 30 days.
create or replace function public.set_membership_selections(p_games uuid[])
returns void
language plpgsql security definer set search_path = public, pg_temp
as $$
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
  if exists (select 1 from unnest(p_games) g where g not in (select id from public.games where tier = 'basic')) then
    raise exception 'only basic games can be selected';
  end if;

  if m.selections_updated_at is not null and m.selections_updated_at > now() - interval '30 days' then
    raise exception 'you can change your games once every 30 days (next change after %)',
      (m.selections_updated_at + interval '30 days');
  end if;

  delete from public.membership_selections where user_id = auth.uid();
  insert into public.membership_selections (user_id, game_id)
    select auth.uid(), g from unnest(p_games) g;
  update public.memberships set selections_updated_at = now(), updated_at = now() where user_id = auth.uid();
end;
$$;

-- ===========================================================================
-- Premium-game subscriptions (OMNIVERSE, Desolation) — separate from the membership, fed by the
-- same Stripe/RevenueCat webhooks (routed by entitlement). Reuses the membership status/source enums.
-- ===========================================================================
create table if not exists public.game_subscriptions (
  user_id                  uuid not null references auth.users(id) on delete cascade,
  game_id                  uuid not null references public.games(id) on delete cascade,
  status                   membership_status not null default 'none',
  source                   membership_source,
  current_period_end       timestamptz,
  provider_customer_id     text,
  provider_subscription_id text,
  updated_at               timestamptz not null default now(),
  primary key (user_id, game_id)
);
alter table public.game_subscriptions enable row level security;
drop policy if exists gsub_self on public.game_subscriptions;
create policy gsub_self on public.game_subscriptions for select using (auth.uid() = user_id);

-- ===========================================================================
-- Access helper — "can the signed-in player access game X, and via what?"
-- reason: owned | all_access | selected | premium_sub | none
-- Games call this (or read entitlements/membership directly) to gate access/features.
-- ===========================================================================
create or replace function public.my_access()
returns table (game_id uuid, accessible boolean, reason text)
language sql stable security definer set search_path = public, pg_temp
as $$
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
  ) t;
$$;
