/**
 * POST /account/signout — sign the player out of their 1775 account and return to the login page.
 * (A form button on /account posts here.)
 */
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/account/login', SITE_URL), { status: 303 })
}
