/**
 * GET /auth/callback
 *
 * Supabase OAuth callback handler.
 * Google redirects here after the user authenticates.
 * We exchange the one-time code for a session, then
 * send the SuperAdmin to /admin (or redirect param),
 * and anyone else to the homepage.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

const SUPERADMIN_UID = process.env.ADMIN_UID ?? ''
const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code     = searchParams.get('code')
  const rawRedirect = searchParams.get('redirect') || ''
  const redirect    = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/admin'
  const error    = searchParams.get('error')

  // OAuth error (user denied, etc.) — back to login
  if (error) {
    return NextResponse.redirect(new URL('/admin/login', SITE_URL))
  }

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.session) {
      // Only let the SuperAdmin through
      if (data.session.user.id === SUPERADMIN_UID) {
        return NextResponse.redirect(new URL(redirect, SITE_URL))
      }
      // Wrong Google account — sign them out and go home
      await supabase.auth.signOut()
      console.warn(`[security] OAuth login rejected: ${data.session.user.email} (${data.session.user.id})`)
      return NextResponse.redirect(new URL('/', SITE_URL))
    }
  }

  // Fallback — something went wrong, back to login
  return NextResponse.redirect(new URL('/admin/login', SITE_URL))
}
