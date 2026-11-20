# OMNIVERSE × 1775 — full account merge (blueprint)

**Status: planned, not built.** OMNIVERSE is pre-launch and its backend is flexible, so it joins the
central 1775 identity directly (the real merge, not a cautious link). **Its subscription product is
unchanged** — the four tiers (Starter / Hero / Legend / Founder, monthly + annual) and all the
consumable IAPs stay exactly as designed. Only the *identity plumbing* changes.

> Sequencing note: the `omniverse-ascension` repo is mid-refactor (a `mnm3e → oas` rename) with a
> parallel session active. The app/schema edits below should land **when that tree is clear** so we
> don't collide with in-flight work.

## Existing OMNIVERSE subscriptions (preserve as-is)

| Tier | Monthly | Annual | Caps/day | Chars | RC entitlement |
|---|---|---|---|---|---|
| Starter | $5.99 | $57.50 | 25 | 3 | `starter` |
| Hero | $11.99 | $115.10 | 80 | 7 | `hero` |
| Legend | $25.99 | $249.50 | 250 | 12 | `legend` |
| Founder | $35.99 | $345.50 | 500 | ∞ | `founder` |

Plus consumables (caps / omni-credits / victory-points / character-points). All handled today by
OMNIVERSE's `process-purchase` webhook → its own `player_profiles`. **None of this changes.**

## Target architecture

- OMNIVERSE players **sign in with the central 1775 account** (Google / Apple / email) — same account
  as the website and FRACTURE.
- OMNIVERSE **keeps its own Supabase project** for its game backend (big, specialized — AI edge
  functions, the game schema). That project is configured to **trust the central 1775 project's
  logins** (Supabase *Third-Party Auth*), so inside OMNIVERSE `auth.uid()` **is the central 1775
  user id**.
- **RevenueCat `app_user_id` = the central 1775 id.** One purchase then updates BOTH, keyed by the
  same id, with no cross-calls:
  - OMNIVERSE's `process-purchase` → its `player_profiles` (tiers/caps — unchanged).
  - the central platform's `/api/revenuecat/webhook` → `game_subscriptions` (OMNIVERSE shows as owned
    in the 1775 library). OMNIVERSE's four tiers all map to "has OMNIVERSE" centrally; the tier
    granularity stays inside OMNIVERSE.
- OMNIVERSE **reads the central membership** (same central id) to apply 1775 member **perks +
  discounts** in its store.

## Changes (all as code; switched on at the single deployment)

### OMNIVERSE app (`omniverse-ascension`)
1. **Auth → central project.** Add a central-auth Supabase client (`EXPO_PUBLIC_PLATFORM_SUPABASE_URL`
   / `_ANON_KEY`) that owns the session; create the game-data client with `{ accessToken }` returning
   the central session token (so game queries carry the central JWT). Route `store/auth.ts`
   sign-in/up/Google/Apple through the central client. `initRevenueCat(centralUserId)` — same call,
   now a central id.
2. **Membership read** — a small hook fetches the central membership (tier + perks + discount) for the
   signed-in central id; the store applies the member discount.

### OMNIVERSE Supabase (its own project)
3. **Trust the central login** — Dashboard → Authentication → Third-Party Auth → add the central
   project as a JWT issuer.
4. **Re-key to central ids** (new migration, safe pre-launch): identity columns (`player_profiles.user_id`,
   and the other `… references auth.users` columns) now hold the central 1775 id. Drop the hard FK to
   the local `auth.users` (central users don't live in this project); keep them `uuid`; RLS stays
   `auth.uid() = user_id` (which, under Third-Party Auth, equals the central sub). Replace the local
   `handle_new_user` trigger with "create a `player_profiles` row on first authenticated load."
   `process-purchase` logic is **unchanged** — its `app_user_id` is now the central id, which matches
   `player_profiles.user_id`.

### Central platform (`1775gaming-website`) — already built
5. Set `REVENUECAT_PREMIUM_ENTITLEMENTS=omniverse_sub:omniverse` (map OMNIVERSE's RC entitlement to
   the `omniverse` game's `game_subscriptions`). The central RevenueCat webhook already routes it.

## Single-deployment additions (append to DEPLOY_MONETIZATION.md step 7)

- Configure OMNIVERSE's Supabase **Third-Party Auth** to trust the central project.
- Set `EXPO_PUBLIC_PLATFORM_SUPABASE_URL` / `_ANON_KEY` in OMNIVERSE.
- Set `REVENUECAT_PREMIUM_ENTITLEMENTS` on the central platform.
- In RevenueCat, register **both** webhook URLs (OMNIVERSE's `process-purchase` and the central
  `/api/revenuecat/webhook`) — RevenueCat supports multiple — or forward from `process-purchase`.

## Preserved (important)

Every subscription tier, price, cap/char limit, and consumable IAP — unchanged. OMNIVERSE's whole
game backend + AI edge functions — unchanged. **The only change is identity:** ids become the central
1775 id, and sign-in comes from the hub.
