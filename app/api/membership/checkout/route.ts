/**
 * POST /api/membership/checkout — start a Stripe Checkout session for a chosen membership plan.
 * The /account plan buttons post `plan` (basic_monthly | basic_annual | allaccess_monthly |
 * allaccess_annual); we look up its Stripe price and tag the subscription with its tier.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'
import { PLANS, isPlanKey, planPriceId } from '@/lib/billing-plans'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/account/login', SITE_URL), { status: 303 })

  try {
    const form = await req.formData()
    const planKey = form.get('plan')
    if (!isPlanKey(planKey)) throw new Error('invalid plan')
    const plan = PLANS[planKey]
    const price = planPriceId(plan)
    if (!price) throw new Error(`${plan.priceEnv} is not configured`)

    const { data: membership } = await supabase
      .from('memberships')
      .select('provider_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    const customerId = (membership?.provider_customer_id as string | null) || undefined

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: { metadata: { userId: user.id, tier: plan.tier } },
      ...(customerId ? { customer: customerId } : { customer_email: user.email ?? undefined }),
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/account?membership=success`,
      cancel_url: `${SITE_URL}/account`,
    })

    if (!session.url) throw new Error('no checkout url returned')
    return NextResponse.redirect(session.url, { status: 303 })
  } catch (e) {
    console.error('[membership checkout]', e)
    return NextResponse.redirect(new URL('/account?membership=error', SITE_URL), { status: 303 })
  }
}
