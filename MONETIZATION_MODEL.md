# 1775 Monetization Model (locked 2026-11-19)

Your decisions, turned into the spec I'll build to. A few points are my interpretation — they're
marked **ASSUMPTION**; correct any and I'll adjust before I commit the database schema.

## Accounts
One **1775 account** for every game (central login). **OMNIVERSE = full account merge** — its
players sign in with the 1775 account (one identity everywhere). FRACTURE and the web use it
natively. *(The OMNIVERSE merge is the biggest piece and lives in its own app repo — a later build.)*

## Game classes
- **Basic games** — included in the membership. (FRACTURE; future small/web games.)
- **Premium games** — **OMNIVERSE** and **Desolation** — each sold with its **own subscription**,
  separate from the membership.

## The 1775 Membership — two tiers
Runs on **both rails** (Stripe web + RevenueCat mobile), tied to the one 1775 account.

| Tier | Price | What you get |
|---|---|---|
| **Basic** | **$4.99 / mo** (+ annual discount) | Access to **3 basic games of your choice** · change the picks **once every 30 days** · basic perks · member discounts |
| **All-Access** | **$9.99 / mo** (+ annual discount) | **All** basic games · **perks in every game** (including premium) · member discounts |

**Premium games are NOT included in these tiers** — OMNIVERSE / Desolation need their own
subscription to play. A 1775 member still gets **perks + discounts** inside them (All-Access = perks
everywhere).

## What "access" means, per game
- **FRACTURE** (free-to-play basic game): the game is free; **membership unlocks multiplayer + ranked
  leaderboards** (plus minor perks added later).
- A **paid basic game** (if any): membership = entry.
- **Premium games**: entry via their own subscription; membership adds perks/discounts, not access.

## Perks + discounts
- **Perks**: member badge, in-game currency/boosts, cosmetics, early access (list grows over time).
- **Discounts**: members get a discount on in-game purchases.
- **Scope**: Basic tier = basic perks; All-Access = perks in **all** games.

## My assumptions — correct any
1. **ASSUMPTION — Annual pricing** ≈ 2 months free: Basic **$49/yr**, All-Access **$99/yr**. Give me
   your exact annual numbers.
2. **ASSUMPTION** — the Basic tier's "3 games" are chosen from **basic games only** (premium games
   never count toward the 3).
3. **ASSUMPTION** — All-Access gives perks **and** discounts inside premium games too (just not free
   access to them).
4. **ASSUMPTION** — "basic perks" vs "perks in all games" means the same perk set, applied only in a
   Basic member's accessible games vs everywhere for All-Access.
5. **ASSUMPTION** — at launch there may be fewer than 3 basic games; Basic tier then just grants the
   basic games that exist ("up to 3").

## What this means in the database (built on confirm)
- `games.tier` → `basic` | `premium` (seed: FRACTURE = basic, OMNIVERSE + Desolation = premium).
- `memberships.tier` → `basic` | `all_access`, plus a **pick-3** table (`membership_selections`) and a
  `set_membership_selections()` function that enforces ≤ 3 basic games and the once-per-30-days lock.
- `game_subscriptions` → the premium-game subs (OMNIVERSE, Desolation), fed by the **same** Stripe +
  RevenueCat webhooks (routed by which entitlement the purchase is for: membership → `memberships`,
  premium game → `game_subscriptions`).
- An **access helper** each game reads ("can this player play game X, and with which perks/discount").

## Build order after confirm
1. Schema migration for the tiered model (above) + updated seed.
2. Webhook routing (membership vs premium-game entitlements) on both rails.
3. Tiered membership UI on `/account` (choose plan, pick your 3 games, manage).
4. Then the per-game bridges: OMNIVERSE (account merge + its premium sub), FRACTURE (read access to
   unlock multiplayer/ranked).

Nothing here is deployed or applied to the live database — it's the plan we build to.
