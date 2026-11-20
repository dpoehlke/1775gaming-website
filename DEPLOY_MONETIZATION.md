# 1775 — Monetization-ready single deployment

**Goal:** get everything **code-ready** so one coordinated go-live turns on monetization across the
whole 1775 ecosystem — **both billing rails** (Stripe on web + RevenueCat on mobile) feeding **one
cross-game 1775 membership**. Everything built so far is free (code + config). **The only time you
spend money is the final sequence below** — the Supabase plan upgrade and the deploy — and you do it
once, after everything is verified in test mode.

This is the index. The detailed dashboard steps live in `SETUP_PLATFORM.md` (accounts) and
`SETUP_MEMBERSHIP.md` (Stripe).

**Status 2026-11-20 — all code is built** (central hub, FRACTURE gate, site nav, OMNIVERSE merge +
member-perks read). What's left is this runbook: the cloud setup you do once, below. Nothing is
deployed and no billing keys are set.

---

## Readiness at a glance

| Piece | Platform | Monetization | Status |
|---|---|---|---|
| **1775 hub** (the site) | web | central membership, **both rails** | **code-ready** — Stripe checkout/portal/webhook ✓, RevenueCat webhook ✓ |
| **Player accounts + library** | web | — | **code-ready** (Phase 1) |
| **OMNIVERSE: Ascension** | iOS/Android | RevenueCat (own tiers) + the 1775 membership | **merge BUILT** — central login + RevenueCat appUserID + member-perks read (`omniverse-ascension` `49fae80`+`d60747b`); awaits deploy-time config in step 7 |
| **FRACTURE** | web | reads the 1775 membership | **gate BUILT** — unlocks multiplayer/ranked for members (`games/fracture` `5597ecb`); awaits the hub URL/key at deploy |
| **Desolation** | iOS/Android | later | coming soon (in catalog) |

The central hub is the thing that had to be finished first, and it is: **a membership bought on
either rail (Stripe web or RevenueCat mobile) writes the same `memberships` row** via one code path
(`lib/membership.ts` → `setMembership`), so perks are identical everywhere.

---

## The single deployment, in order

Do these **once**, in this order. Steps 1–6 are the hub; 7 is OMNIVERSE; 8 verifies.

1. **Upgrade Supabase** (the *website* project) to the paid plan. *(This is the spend.)*
2. **Apply the schema** — run **both** migrations in order in the Supabase SQL editor:
   `supabase/migrations/0001_platform_accounts.sql`, then `0002_monetization_tiers.sql`
   (tiers, the pick-3, premium-game subs, the access helper).
   *(If you'd rather not paste SQL, I can apply them for you through the connected Supabase.)*
3. **Enable sign-in** — Google + Email now, Apple when ready; add the `/account/callback` redirect
   (`SETUP_PLATFORM.md` steps 2–3).
4. **Stripe (web rail)** — in **Test mode**: create **two products** — *Basic* and *All-Access* — each
   with a **monthly + annual price** (4 prices total), plus the webhook + keys (`SETUP_MEMBERSHIP.md`).
   Put the four price ids in `STRIPE_PRICE_BASIC_MONTHLY`, `STRIPE_PRICE_BASIC_ANNUAL`,
   `STRIPE_PRICE_ALLACCESS_MONTHLY`, `STRIPE_PRICE_ALLACCESS_ANNUAL`.
5. **RevenueCat (mobile rail)** —
   - Create the **membership entitlements** — `basic` and `all_access` — each attached to its App
     Store + Play subscription product. Set `REVENUECAT_BASIC_ENTITLEMENT` and
     `REVENUECAT_ALLACCESS_ENTITLEMENT` to their ids (so a mobile membership sets the right tier).
   - Route **premium-game** purchases with `REVENUECAT_PREMIUM_ENTITLEMENTS` in the form
     `entitlementId:gameSlug` (comma-separated). For OMNIVERSE: `omniverse_sub:omniverse` — its tier
     purchase then also marks OMNIVERSE owned in the central `game_subscriptions`.
   - Add a **webhook** → `https://www.1775gaming.com/api/revenuecat/webhook`, and set its
     **Authorization** header to a secret you choose → that secret is `REVENUECAT_WEBHOOK_AUTH`.
6. **Set all env vars in Vercel** (full list below) and **deploy the site**.
7. **OMNIVERSE go-live** (its repo, `omniverse-ascension`, branch `feat/equipment-pawnshop-auction`) —
   the account-merge is **built** (`49fae80`+`d60747b`); it just needs switching on at deploy:
   - **Third-Party Auth:** in OMNIVERSE's Supabase project → Authentication → Third-Party Auth, add the
     **central 1775 project** as a trusted JWT issuer (so inside OMNIVERSE `auth.uid()` = the central id).
   - **Apply its migration** `supabase/migrations/20261120000001_central_1775_account_merge.sql`
     (drops the auth.users FKs + the new-user trigger, adds `ensure_player_profile()`).
   - **Set its env** `EXPO_PUBLIC_PLATFORM_SUPABASE_URL` / `EXPO_PUBLIC_PLATFORM_SUPABASE_ANON_KEY` to the
     central project (in the OMNIVERSE build / EAS, **not** Vercel). The app then signs in against the hub,
     and RevenueCat's `appUserID` is automatically the central id — one purchase feeds both OMNIVERSE's own
     `process-purchase` (tiers/caps — unchanged) and the central `game_subscriptions`.
   - **Verify** the Deno edge functions that call `getUser(jwt)` (e.g. `supabase/functions/_shared/auth.ts`)
     accept the central JWT under Third-Party Auth; point them at the central issuer/JWKS if any reject it.
8. **Verify both rails** —
   - Web: `/account` → Become a member → Stripe test card `4242 4242 4242 4242` → you become a member.
   - Mobile: a RevenueCat **sandbox** purchase of the membership → the same account shows Member on web.

---

## What each repo still needs (so nothing is missed)

- **1775 site** — ✅ nothing code-side; just the dashboard setup in steps 2–6.
- **OMNIVERSE (`omniverse-ascension`)** — ✅ code built (`49fae80`+`d60747b`): central login, RevenueCat
  `appUserID` = central id, and a member-perks read in the Store. Only the deploy-time config in step 7
  remains. Its own RevenueCat tiers + Supabase backend are untouched.
- **FRACTURE (`games/fracture`)** — ✅ code built (`5597ecb`): the `Backend` seam reads the 1775
  membership and gates multiplayer/ranked. At deploy, point its env at the hub project
  (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` = central) and set `VITE_BACKEND=supabase`.
- **Desolation** — ships later; already in the catalog as "coming soon."

---

## Master environment variables (set these in Vercel for the site)

```
# Supabase (website project — the central hub)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://www.1775gaming.com

# Stripe (web membership — two products, four prices)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BASIC_MONTHLY=
STRIPE_PRICE_BASIC_ANNUAL=
STRIPE_PRICE_ALLACCESS_MONTHLY=
STRIPE_PRICE_ALLACCESS_ANNUAL=

# RevenueCat (mobile membership + premium-game routing)
REVENUECAT_WEBHOOK_AUTH=
REVENUECAT_BASIC_ENTITLEMENT=
REVENUECAT_ALLACCESS_ENTITLEMENT=
REVENUECAT_PREMIUM_ENTITLEMENTS=omniverse_sub:omniverse
```

(Existing site vars — Resend, PostHog, admin, OMNIVERSE service keys — stay as they are.)

**OMNIVERSE mobile build** (set in the `omniverse-ascension` app / EAS env, **not** Vercel):
`EXPO_PUBLIC_PLATFORM_SUPABASE_URL` and `EXPO_PUBLIC_PLATFORM_SUPABASE_ANON_KEY` = the central 1775
project. OMNIVERSE's existing `EXPO_PUBLIC_SUPABASE_*` stay pointed at its own game-data project.

---

## Decisions — LOCKED 2026-11-19

The monetization model is decided. Full spec in **`MONETIZATION_MODEL.md`**. In short:
- **OMNIVERSE = full account merge** (central 1775 login).
- **Game classes:** basic games (in the membership) vs **premium games — OMNIVERSE + Desolation —
  with their own separate subscriptions**.
- **Membership, two tiers (both rails):** **Basic $4.99/mo** = 3 basic games of choice (change
  1×/30 days) + basic perks + discounts; **All-Access $9.99/mo** = all basic games + perks in all
  games + discounts. Annual discount on both.
- **FRACTURE** (free basic game): membership unlocks multiplayer + ranked.
- **Perks + discounts** on in-game purchases.

(A few pricing/perk assumptions are flagged in `MONETIZATION_MODEL.md` for final confirm.)

Nothing here is deployed; the whole thing waits on the single sequence above.
