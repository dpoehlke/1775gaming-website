# 1775 Platform — Phase 1 setup (player accounts + library)

**What Phase 1 adds:** a real **1775 account** players can sign into with Google, Apple, or email,
and a **"Your Games"** page at `1775gaming.com/account` that lists every 1775 game. Nothing here
charges money yet — membership billing is Phase 2.

Everything below is a **manual step you do in a dashboard** (I can't click these for you). Do them in
order. Nothing is deployed until you merge the `feat/platform-accounts` branch.

---

## 1. Add the database tables — Supabase (about 5 minutes)

1. Go to **supabase.com** → open your **website project** (the one your site uses — *not* the
   Omniverse one).
2. Left sidebar → **SQL Editor** → **New query**.
3. Open the file `supabase/migrations/0001_platform_accounts.sql` in the repo, **copy all of it**,
   paste it into the editor, and click **Run**.

This creates five new tables — `profiles`, `games`, `entitlements`, `memberships`, `perks` — and
seeds your three games (OMNIVERSE, FRACTURE, Desolation). It is additive and safe: it does **not**
touch your existing tables, and if any of those names already exist it skips them.

---

## 2. Turn on the sign-in methods — Supabase → **Authentication → Providers**

- **Email** — should already be on. For real emails to send in production you'll want SMTP; you
  already have **Resend**, so tell me and I'll wire Resend into Supabase. (Supabase's built-in email
  works for testing, with low limits.)
- **Google** — already configured (you use it for admin login). Nothing to add here, just allow the
  redirect in step 3.
- **Apple** — toggle on and paste a Client ID + Secret from Apple Developer. **Apple's setup is the
  fiddly one** — when you're ready, tell me and I'll walk you through the Apple Developer screens
  click-by-click. You can launch with **Google + Email first** and add Apple later.

---

## 3. Allow the redirect — Supabase → **Authentication → URL Configuration**

- **Site URL:** `https://www.1775gaming.com`
- **Redirect URLs** — add both:
  - `https://www.1775gaming.com/account/callback`
  - `http://localhost:3000/account/callback` (for testing on your computer)
- **Save.**

---

## 4. Environment variables

**Nothing new for Phase 1.** Your existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
and `NEXT_PUBLIC_SITE_URL` already cover it.

---

## 5. Try it

1. After step 1 is done, visit **`/account/login`** (locally with `npm run dev`, or on the deployed
   site once merged).
2. Sign in with Google or email → you land on **`/account`** ("Your Games").
3. Before step 1 is applied, `/account` just shows an empty catalog — that's expected.

---

## Not live yet (Phase 2 and later)

- **Membership billing (Stripe) + perks** — the "Become a member" button is intentionally disabled.
- **Nav link** — adding "Sign in / Your Games" to the main site menu (left out so it doesn't clash
  with your in-progress edits).
- **OMNIVERSE players** — merging the existing Omniverse accounts into the central 1775 account.

## Where this lives

Branch **`feat/platform-accounts`** — review it, and nothing deploys or merges until you say so.
New files: `supabase/migrations/0001_platform_accounts.sql`, `lib/supabase-browser.ts`, and
`app/account/*` (login, callback, signout, the library page).
