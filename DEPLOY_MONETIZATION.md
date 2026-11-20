# 1775 — Monetization-ready single deployment

**Goal:** get everything **code-ready** so one coordinated go-live turns on monetization across the
whole 1775 ecosystem — **both billing rails** (Stripe on web + RevenueCat on mobile) feeding **one
cross-game 1775 membership**. Everything built so far is free (code + config). **The only time you
spend money is the final sequence below** — the Supabase plan upgrade and the deploy — and you do it
once, after everything is verified in test mode.

This is the index. The detailed dashboard steps live in `SETUP_PLATFORM.md` (accounts) and
`SETUP_MEMBERSHIP.md` (Stripe).

---

## Readiness at a glance

| Piece | Platform | Monetization | Status |
|---|---|---|---|
| **1775 hub** (the site) | web | central membership, **both rails** | **code-ready** — Stripe checkout/portal/webhook ✓, RevenueCat webhook ✓ |
| **Player accounts + library** | web | — | **code-ready** (Phase 1) |
| **OMNIVERSE: Ascension** | iOS/Android | RevenueCat (own tiers) + the 1775 membership | **own IAP already built**; needs the **bridge** (below) to feed the central membership — in its own repo |
| **FRACTURE** | web | reads the 1775 membership/entitlements | needs its backend pointed at the hub (its Supabase auth seam is built) |
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
4. **Stripe (web rail)** — product + keys + webhook (`SETUP_MEMBERSHIP.md`). Start in **Test mode**.
5. **RevenueCat (mobile rail)** —
   - Create a **1775 Membership** entitlement in RevenueCat, attached to an App Store + Play
     subscription product.
   - Add a **webhook** → `https://www.1775gaming.com/api/revenuecat/webhook`, and set its
     **Authorization** header to a secret you choose → that secret is `REVENUECAT_WEBHOOK_AUTH`.
   - Set `REVENUECAT_MEMBERSHIP_ENTITLEMENT` to that entitlement's id (so only membership purchases —
     not a game's own IAPs — move the central membership).
6. **Set all env vars in Vercel** (full list below) and **deploy the site**.
7. **OMNIVERSE bridge** (its repo, `omniverse-ascension`) — so mobile memberships land centrally:
   - When the app configures RevenueCat, set the **`appUserID` to the signed-in 1775 account id**
     (requires OMNIVERSE to sign in with the central 1775 account — the account-merge step).
   - RevenueCat then delivers membership events to the hub webhook automatically. OMNIVERSE's *own*
     tier IAPs keep working against its own project unchanged.
8. **Verify both rails** —
   - Web: `/account` → Become a member → Stripe test card `4242 4242 4242 4242` → you become a member.
   - Mobile: a RevenueCat **sandbox** purchase of the membership → the same account shows Member on web.

---

## What each repo still needs (so nothing is missed)

- **1775 site** — ✅ nothing code-side; just the dashboard setup in steps 2–6.
- **OMNIVERSE (`omniverse-ascension`)** — sign in with the central 1775 account and set RevenueCat
  `appUserID` to that id (step 7). Its existing RevenueCat tier purchases and its own Supabase are
  untouched. *(This is the next build — it's a separate repo.)*
- **FRACTURE (`games/fracture`)** — point its Supabase auth at the hub project and read the
  membership/entitlements (its `Backend` seam already supports this). Optional: its own paid items
  later via Stripe. *(Build after OMNIVERSE.)*
- **Desolation** — ships later; already in the catalog as "coming soon."

---

## Master environment variables (set these in Vercel for the site)

```
# Supabase (website project — the central hub)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://www.1775gaming.com

# Stripe (web membership)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MEMBERSHIP_PRICE_ID=

# RevenueCat (mobile membership)
REVENUECAT_WEBHOOK_AUTH=
REVENUECAT_MEMBERSHIP_ENTITLEMENT=
```

(Existing site vars — Resend, PostHog, admin, OMNIVERSE service keys — stay as they are.)

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
