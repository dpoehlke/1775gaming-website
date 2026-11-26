# 1775 Gaming master account

Every 1775 Gaming game and app signs players in with **one account**. Players use
Google, Apple, or an email and password they create. That account lives in the
Supabase project **`1775gaming`** (`ksizqvecclwvevfzdjnb`), called "the platform"
below. No game has its own separate logins.

Every time a player signs in, and whenever a native app comes back to the
foreground, the game asks the platform one question:

```sql
select account_check('<game-slug>', '<app version>', '<ios|android|web|desktop>');
```

The game only continues when the answer has `"allowed": true`. Otherwise it shows the
reason:

| `code` | Meaning | Player sees |
|---|---|---|
| `banned` | Active ban (all games, or this game) | Reason, plus a support email |
| `suspended` | Active suspension | Reason and end time |
| `maintenance` | `games.maintenance = true` | Your maintenance message and a Try again button |
| `not_released` | `games.status = 'coming_soon'` | "Coming soon" |
| `update_required` | App version below `games.min_version` for that platform | Update button (store or play link) |
| `no_access` | Not free, and no purchase, membership or subscription | Link to membership options |
| `ok` | All good | The game |

Platform admins (`platform_admins` table) get past maintenance, unreleased and
access checks so they can test. They are **not** exempt from bans.

Servers must run the check too, because a web page or app can be tampered with.
Hear & Translate's server and Omniverse's Edge Functions call `account_check` with
the player's token on every request.

## Where each game stands (Nov 26, 2026)

| Game / app | Sign-in | Checks |
|---|---|---|
| Gravity Breakout, Drop Merge, Portal Snake, Memory Grid, Gravity Flip | Web gate (`/sdk/v1/1775-account.js`) | On load |
| Invasion Defense | Native gate (Expo app); web gate in browser/Capacitor (email only, because Google blocks app WebViews) | Sign-in + foreground |
| Hear & Translate | Native gate (app) + web app sign-in | Sign-in, foreground, and every server call |
| Omniverse: Ascension | Its own login screens, now on the platform; game data stays in the Omniverse project | Sign-in, foreground, Edge Functions. **Needs the dashboard switch-over in its `docs/MASTER_ACCOUNT_MIGRATION.md`** |
| FRACTURE | Platform sign-in, no guests | At sign-in. Backend not deployed yet; see `engine/supabase/DEPLOY.md` |
| Website admin | Google on the platform, locked to `ADMIN_UID` | n/a |

**Not converted on purpose:** After-Hours Lead Kit (business owners use a private owner
key) and Flight Tracker (its own client logins). These are business tools, not games.
Moving their customers into gamer accounts is a business decision.

## Adding a new game

1. Register it on the platform:
   ```sql
   insert into games (slug, name, platforms, status, tier, is_free)
   values ('my-game', 'My Game', '{web}', 'beta', 'basic', true);
   ```
2. **Web game:** add before the game's own script:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js"></script>
   <script src="https://www.1775gaming.com/sdk/v1/1775-account.js"></script>
   <script>Account1775.gate({ game: 'my-game', name: 'My Game', version: '1.0.0' });</script>
   ```
   (Copy the fuller "fail closed" snippet from any arcade game's `index.html`.) Add the game's
   web address to the platform's **Authentication → URL Configuration → Redirect URLs**.
3. **Expo app:** copy `src/account1775/` from the Thorium repo (`mobile/src/account1775`) and wrap
   the app in `<Account1775Gate game="my-game">`. Then add the app's `scheme://auth/callback` to
   the redirect URLs, plus `ios.usesAppleSignIn` and the `expo-apple-authentication` plugin.
4. **Game with its own Supabase project** (for game data): add **Third-Party Auth → Custom OIDC**
   with issuer `https://ksizqvecclwvevfzdjnb.supabase.co/auth/v1`, turn off sign-ups there, and
   create player rows on first sign-in (see Omniverse's `ensure_player_profile()`).

## Running the platform

| Task | How (SQL editor on the platform project, or ask Claude) |
|---|---|
| Make yourself admin | Sign in once anywhere, then `insert into platform_admins (user_id) select id from auth.users where email = 'you@…';` |
| Ban everywhere | `select platform_admin_action('ban', '<user id>', null, 'Reason shown to player');` |
| Ban from one game | `select platform_admin_action('ban', '<user id>', 'omniverse', 'Reason');` |
| Suspend 3 days | `select platform_admin_action('suspend', '<user id>', null, 'Reason', now() + interval '3 days');` |
| Warn | `select platform_admin_action('warn', '<user id>', null, 'Reason');`. Shown once, on their next sign-in |
| Undo a ban, suspension or warning | `select platform_admin_action('revoke_action', p_id => '<account_actions id>');` |
| Give a game for free | `select platform_admin_action('grant_entitlement', '<user id>', 'my-game');` |
| Force an update | `update games set min_version = '{"ios":"1.2.0","android":"1.2.0"}' where slug = 'my-game';` |
| Maintenance on/off | `update games set maintenance = true, maintenance_message = 'Back at 5pm CT' where slug = 'my-game';` |

`platform_admin_action` only works for the service role or a platform admin. Players
never see `internal_note`.

## One-time setup still needed (Supabase dashboard, works on an iPad)

1. **Authentication → Sign In / Providers** on the platform: Email (on), Google (on, with
   your Google OAuth client), Apple (on; Client IDs = every iOS bundle ID, e.g.
   `com.gaming1775.heartranslate`, `com.gaming1775.invasiondefense`, `com.omniverse.ascension`).
2. **Authentication → URL Configuration → Redirect URLs:** every game's web address and every
   app's `scheme://auth/callback` (`heartranslate://`, `invasiondefense://`, `omniverseascension://`).
3. **Authentication → JWT Keys:** move to asymmetric signing keys. Omniverse and FRACTURE can only
   trust platform logins after this.
4. Make yourself a platform admin (table above).

## Known limits

- **Web games on different domains don't share a sign-in.** A player signs in once per game
  site (same account, same password). For true one-click single sign-on across web games,
  host them under one domain, e.g. `play.1775gaming.com/<game>`.
- **Client-side gates can be bypassed** by a determined player. That's fine for free arcade
  games. Anything valuable (purchases, rewards, leaderboards) must be checked on a server.
- **Deleting an account removes its ban history** (cascade). A banned player who deletes their
  account can sign up again with the same email.
- **The old `superadmin_action` function on this project is broken.** It is a copy of
  Omniverse's and refers to tables that don't exist here. Use `platform_admin_action`.
- Migrations for the platform live in this repo: `supabase/migrations/`.
