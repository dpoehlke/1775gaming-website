# 1775 Membership — Phase 2 setup (Stripe billing)

**What Phase 2 adds:** a real **1775 Membership** subscription on the web, with a working
"Become a member" button (Stripe Checkout), a "Manage membership" button (Stripe customer portal),
and perks that switch on when a member is active. It's built **source-agnostic** — a future mobile
(App Store / Google Play) subscription will light up the same membership.

Do **Phase 1 setup first** (`SETUP_PLATFORM.md`). Everything below is dashboard work — I can't click
it for you. Use **Test mode** in Stripe until you're ready to go live.

---

## 1. Make a Stripe account + the membership product (~10 min)

1. Go to **stripe.com**, sign up / sign in. Toggle **Test mode** on (top-right).
2. Left menu → **Product catalog** → **+ Add product**.
   - Name: `1775 Membership`
   - Pricing: **Recurring**, pick a price (e.g. `$4.99` / **month**).
   - Save.
3. On the product, find the **Price** → copy its **Price ID** (looks like `price_1A2b3C...`). You'll
   paste it as `STRIPE_MEMBERSHIP_PRICE_ID`.

## 2. Copy your API keys

- Stripe → **Developers → API keys** (still in Test mode).
- Copy the **Secret key** (`sk_test_...`) → this is `STRIPE_SECRET_KEY`.

## 3. Add the webhook (so memberships turn on automatically)

- Stripe → **Developers → Webhooks → + Add endpoint**.
- Endpoint URL: `https://www.1775gaming.com/api/stripe/webhook`
  (for local testing you'd instead run the Stripe CLI — tell me and I'll give you those commands).
- **Events to send** — add these three:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Save, then open the endpoint and copy its **Signing secret** (`whsec_...`) → this is
  `STRIPE_WEBHOOK_SECRET`.

## 4. Turn on the customer portal (for "Manage membership")

- Stripe → **Settings → Billing → Customer portal** → **Activate** (allow cancel; defaults are fine).

## 5. Add the keys to your environment

Put these three in **Vercel → your project → Settings → Environment Variables** (and in your local
`.env.local` for testing). They're already listed in `.env.local.example`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MEMBERSHIP_PRICE_ID=price_...
```

Redeploy after adding them on Vercel.

---

## 6. Try it (Test mode)

1. Sign in at `/account`, click **Become a member**.
2. On Stripe Checkout use the test card **4242 4242 4242 4242**, any future expiry, any CVC/ZIP.
3. You land back on `/account?membership=success`; within a second or two the webhook flips your
   membership to **Member**, the perks show a green check, and **Manage membership** appears.

---

## Notes & what's next

- **Nothing charges real money** until you switch Stripe out of Test mode and swap in live keys.
- **Membership = perks** right now; it does not auto-unlock paid games. If you want membership to also
  include certain games, tell me and I'll add that rule.
- **Mobile (RevenueCat):** the membership table already accepts `apple`/`google` sources — wiring
  OMNIVERSE's RevenueCat subscriptions into this same membership is a later step.
- Lives on branch **`feat/platform-accounts`** — nothing deploys until you merge.
