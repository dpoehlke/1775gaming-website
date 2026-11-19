/**
 * POST /api/stripe/webhook — Stripe subscription events → the central 1775 membership.
 *
 * The ONLY path that activates/updates a web (Stripe) membership. Verifies the signature, then
 * writes through setMembership() (shared with the future RevenueCat mobile path). Register this URL
 * in the Stripe dashboard and put its signing secret in STRIPE_WEBHOOK_SECRET (see SETUP_MEMBERSHIP).
 */
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { mapStripeStatus, periodEndISO, setMembership } from '@/lib/membership'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) return new NextResponse('missing signature or secret', { status: 400 })

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret)
  } catch (e) {
    return new NextResponse(`invalid signature: ${(e as Error).message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId
        if (userId && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(session.subscription as string)
          await setMembership({
            userId,
            status: mapStripeStatus(sub.status),
            source: 'stripe',
            currentPeriodEnd: periodEndISO(sub),
            providerCustomerId: (session.customer as string) ?? null,
            providerSubscriptionId: sub.id,
          })
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (userId) {
          await setMembership({
            userId,
            status: event.type === 'customer.subscription.deleted' ? 'canceled' : mapStripeStatus(sub.status),
            source: 'stripe',
            currentPeriodEnd: periodEndISO(sub),
            providerCustomerId: sub.customer as string,
            providerSubscriptionId: sub.id,
          })
        }
        break
      }
      default:
        break
    }
  } catch (e) {
    console.error('[stripe webhook] handler error', e)
    return new NextResponse('handler error', { status: 500 })
  }

  return NextResponse.json({ received: true })
}
