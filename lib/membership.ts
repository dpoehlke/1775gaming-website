/**
 * Membership write-path — the ONE canonical place that updates a player's cross-game 1775
 * membership. Called by the Stripe webhook now, and designed to be reused by a RevenueCat (mobile
 * App Store / Google Play) webhook later, so a subscription bought on any platform grants the same
 * membership everywhere. Server-side only (uses the service-role key; bypasses RLS).
 */
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

export type MembershipStatus = 'none' | 'active' | 'trialing' | 'past_due' | 'canceled'
export type MembershipSource = 'stripe' | 'apple' | 'google' | 'manual'

export interface MembershipWrite {
  userId: string
  status: MembershipStatus
  source: MembershipSource
  tier?: string
  currentPeriodEnd?: string | null
  providerCustomerId?: string | null
  providerSubscriptionId?: string | null
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/** Upsert the player's membership row (one per user). */
export async function setMembership(m: MembershipWrite): Promise<void> {
  const row: Record<string, unknown> = {
    user_id: m.userId,
    status: m.status,
    source: m.source,
    updated_at: new Date().toISOString(),
  }
  if (m.tier !== undefined) row.tier = m.tier
  if (m.currentPeriodEnd !== undefined) row.current_period_end = m.currentPeriodEnd
  if (m.providerCustomerId !== undefined) row.provider_customer_id = m.providerCustomerId
  if (m.providerSubscriptionId !== undefined) row.provider_subscription_id = m.providerSubscriptionId

  const { error } = await serviceClient().from('memberships').upsert(row, { onConflict: 'user_id' })
  if (error) throw error
}

/** Map a Stripe subscription status to our membership status. */
export function mapStripeStatus(s: string): MembershipStatus {
  switch (s) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled'
    default:
      return 'none'
  }
}

/** Subscription period end as ISO (tolerant of Stripe API-version field drift). */
export function periodEndISO(sub: Stripe.Subscription): string | null {
  const t = (sub as unknown as { current_period_end?: number }).current_period_end
  return typeof t === 'number' ? new Date(t * 1000).toISOString() : null
}
