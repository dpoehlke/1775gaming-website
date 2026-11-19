/**
 * POST /api/revenuecat/webhook — RevenueCat (App Store / Google Play) subscription events →
 * the central 1775 membership, through the shared setMembership() path (same as Stripe).
 *
 * Auth: RevenueCat sends the Authorization header you configure in its dashboard; it must equal
 * REVENUECAT_WEBHOOK_AUTH. Only events for REVENUECAT_MEMBERSHIP_ENTITLEMENT affect membership.
 * The RevenueCat app_user_id must be the player's central 1775 account id (set by the mobile app).
 */
import { NextRequest, NextResponse } from 'next/server'
import { setMembership } from '@/lib/membership'
import { rcEventToMembership, type RevenueCatEvent } from '@/lib/revenuecat'

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
    const membership = rcEventToMembership(event, process.env.REVENUECAT_MEMBERSHIP_ENTITLEMENT)
    if (membership) await setMembership(membership)
  } catch (e) {
    console.error('[revenuecat webhook] handler error', e)
    return new NextResponse('handler error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
