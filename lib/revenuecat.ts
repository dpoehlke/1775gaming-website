/**
 * RevenueCat → central platform mapping (the MOBILE rail).
 *
 * Routes a RevenueCat (App Store / Google Play) event to the right place by its entitlement:
 *   - the Basic / All-Access membership entitlements → the central 1775 membership (with tier)
 *   - a premium game's entitlement (OMNIVERSE, Desolation) → that game's game_subscriptions row
 * Everything flows through the same setMembership()/setGameSubscription() paths as Stripe.
 *
 * Contract: the RevenueCat `app_user_id` MUST be the player's central 1775 account id.
 */
import type { MembershipSource, MembershipStatus } from './membership'
import type { MembershipTier } from './billing-plans'

export interface RevenueCatEvent {
  type?: string
  app_user_id?: string
  original_app_user_id?: string
  product_id?: string
  store?: string // APP_STORE | MAC_APP_STORE | PLAY_STORE | STRIPE | PROMOTIONAL | ...
  expiration_at_ms?: number
  entitlement_id?: string | null // deprecated single
  entitlement_ids?: string[] | null
}

export interface RcRoutingConfig {
  basicEntitlement?: string
  allAccessEntitlement?: string
  premiumEntitlements: Record<string, string> // entitlement id -> game slug
}

/** Build routing from env: REVENUECAT_BASIC_ENTITLEMENT, REVENUECAT_ALLACCESS_ENTITLEMENT,
 *  REVENUECAT_PREMIUM_ENTITLEMENTS="entId:gameSlug,entId2:gameSlug2". */
export function rcRoutingFromEnv(): RcRoutingConfig {
  const premium: Record<string, string> = {}
  for (const pair of (process.env.REVENUECAT_PREMIUM_ENTITLEMENTS ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const [ent, slug] = pair.split(':').map((s) => s.trim())
    if (ent && slug) premium[ent] = slug
  }
  return {
    basicEntitlement: process.env.REVENUECAT_BASIC_ENTITLEMENT || undefined,
    allAccessEntitlement: process.env.REVENUECAT_ALLACCESS_ENTITLEMENT || undefined,
    premiumEntitlements: premium,
  }
}

export interface RcMapped {
  target: { kind: 'membership'; tier: MembershipTier } | { kind: 'game'; slug: string }
  userId: string
  status: MembershipStatus
  source: MembershipSource
  currentPeriodEnd: string | null
  providerCustomerId: string | null
  providerSubscriptionId: string | null
}

function rcStatus(type?: string): MembershipStatus | null {
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
    case 'NON_RENEWING_PURCHASE':
    case 'CANCELLATION': // auto-renew off — still active until expiration
      return 'active'
    case 'BILLING_ISSUE':
      return 'past_due'
    case 'EXPIRATION':
    case 'SUBSCRIPTION_PAUSED':
      return 'canceled'
    default:
      return null // TRANSFER / TEST / etc.
  }
}

export function rcSourceFromStore(store?: string): MembershipSource {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'apple'
  if (store === 'PLAY_STORE') return 'google'
  if (store === 'STRIPE') return 'stripe'
  return 'manual'
}

/** Map an event to a routed subscription write, or null to ignore (unknown entitlement / event type). */
export function mapRcEvent(ev: RevenueCatEvent, cfg: RcRoutingConfig): RcMapped | null {
  const userId = ev.app_user_id
  if (!userId) return null
  const status = rcStatus(ev.type)
  if (!status) return null

  const ents = ev.entitlement_ids ?? (ev.entitlement_id ? [ev.entitlement_id] : [])

  let target: RcMapped['target'] | null = null
  if (cfg.allAccessEntitlement && ents.includes(cfg.allAccessEntitlement)) {
    target = { kind: 'membership', tier: 'all_access' }
  } else if (cfg.basicEntitlement && ents.includes(cfg.basicEntitlement)) {
    target = { kind: 'membership', tier: 'basic' }
  } else {
    for (const [ent, slug] of Object.entries(cfg.premiumEntitlements)) {
      if (ents.includes(ent)) { target = { kind: 'game', slug }; break }
    }
  }
  if (!target) return null

  return {
    target,
    userId,
    status,
    source: rcSourceFromStore(ev.store),
    currentPeriodEnd: ev.expiration_at_ms ? new Date(ev.expiration_at_ms).toISOString() : null,
    providerCustomerId: ev.original_app_user_id ?? userId,
    providerSubscriptionId: ev.product_id ?? null,
  }
}
