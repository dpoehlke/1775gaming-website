/**
 * RevenueCat → central 1775 membership mapping (the MOBILE rail).
 *
 * RevenueCat (App Store / Google Play) sends subscription events to /api/revenuecat/webhook, which
 * maps them through the SAME setMembership() path as Stripe — so a membership bought on mobile grants
 * the same cross-game perks as one bought on the web, and vice-versa.
 *
 * Contract: the RevenueCat `app_user_id` MUST be the player's central 1775 account id (the mobile
 * app sets this when it configures RevenueCat). Events are filtered to the 1775 membership
 * entitlement so a game's OWN in-app purchases (e.g. OMNIVERSE tier upgrades) never flip the
 * cross-game membership.
 */
import type { MembershipSource, MembershipStatus, MembershipWrite } from './membership'

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

export function rcSourceFromStore(store?: string): MembershipSource {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'apple'
  if (store === 'PLAY_STORE') return 'google'
  if (store === 'STRIPE') return 'stripe'
  return 'manual'
}

/**
 * Map a RevenueCat event to a membership write, or null to ignore it (wrong entitlement, or an
 * event type that doesn't change membership state). `membershipEntitlement` is the RevenueCat
 * entitlement id that represents the 1775 membership (REVENUECAT_MEMBERSHIP_ENTITLEMENT).
 */
export function rcEventToMembership(
  ev: RevenueCatEvent,
  membershipEntitlement?: string,
): MembershipWrite | null {
  const userId = ev.app_user_id
  if (!userId) return null

  // Only the 1775 membership entitlement moves the cross-game membership.
  if (membershipEntitlement) {
    const ents = ev.entitlement_ids ?? (ev.entitlement_id ? [ev.entitlement_id] : [])
    if (!ents.includes(membershipEntitlement)) return null
  }

  let status: MembershipStatus
  switch (ev.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
    case 'NON_RENEWING_PURCHASE':
      status = 'active'
      break
    case 'CANCELLATION': // auto-renew turned off — still active until it expires
      status = 'active'
      break
    case 'BILLING_ISSUE':
      status = 'past_due'
      break
    case 'EXPIRATION':
    case 'SUBSCRIPTION_PAUSED':
      status = 'canceled'
      break
    default:
      return null // TRANSFER / TEST / etc. — don't touch membership state
  }

  return {
    userId,
    status,
    source: rcSourceFromStore(ev.store),
    currentPeriodEnd: ev.expiration_at_ms ? new Date(ev.expiration_at_ms).toISOString() : null,
    providerCustomerId: ev.original_app_user_id ?? userId,
    providerSubscriptionId: ev.product_id ?? null,
  }
}
