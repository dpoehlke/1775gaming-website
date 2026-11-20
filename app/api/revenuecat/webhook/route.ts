/**
 * POST /api/revenuecat/webhook — RevenueCat (App Store / Google Play) events → the central platform.
 *
 * Routes by entitlement: the membership entitlements → the 1775 membership (with tier); a premium
 * game's entitlement → that game's game_subscriptions row. Same write paths as Stripe.
 * Auth: the Authorization header must equal REVENUECAT_WEBHOOK_AUTH. app_user_id = central 1775 id.
 */
import { NextRequest, NextResponse } from 'next/server'
import { setGameSubscription, setMembership } from '@/lib/membership'
import { mapRcEvent, rcRoutingFromEnv, type RevenueCatEvent } from '@/lib/revenuecat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH
  if (!expected || req.headers.get('authorization') !== expected) {
    return new NextResponse('unauthorized', { status: 401 })
  }

  let payload: { event?: RevenueCatEvent }
  try {
    payload = await req.json()
  } catch {
    return new NextResponse('bad json', { status: 400 })
  }

  const event = payload?.event
  if (!event) return NextResponse.json({ ignored: 'no event' })

  try {
    const m = mapRcEvent(event, rcRoutingFromEnv())
    if (m) {
      if (m.target.kind === 'membership') {
        await setMembership({
          userId: m.userId,
          status: m.status,
          source: m.source,
          tier: m.target.tier,
          currentPeriodEnd: m.currentPeriodEnd,
          providerCustomerId: m.providerCustomerId,
          providerSubscriptionId: m.providerSubscriptionId,
        })
      } else {
        await setGameSubscription({
          userId: m.userId,
          gameSlug: m.target.slug,
          status: m.status,
          source: m.source,
          currentPeriodEnd: m.currentPeriodEnd,
          providerCustomerId: m.providerCustomerId,
          providerSubscriptionId: m.providerSubscriptionId,
        })
      }
    }
  } catch (e) {
    console.error('[revenuecat webhook] handler error', e)
    return new NextResponse('handler error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
