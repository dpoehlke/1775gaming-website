/**
 * POST /api/membership/portal — open the Stripe customer portal so a member can manage or cancel.
 * The /account "Manage membership" button posts here.
 */
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/account/login', SITE_URL), { status: 303 })

  try {
    const { data: membership } = await supabase
      .from('memberships')
      .select('provider_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()
    const customerId = membership?.provider_customer_id as string | null
    if (!customerId) return NextResponse.redirect(new URL('/account', SITE_URL), { status: 303 })

    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${SITE_URL}/account`,
    })
    return NextResponse.redirect(portal.url, { status: 303 })
  } catch (e) {
    console.error('[membership portal]', e)
    return NextResponse.redirect(new URL('/account?membership=error', SITE_URL), { status: 303 })
  }
}
