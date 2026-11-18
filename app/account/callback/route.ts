/**
 * GET /account/callback — player auth callback (OAuth code or email magic-link).
 *
 * Unlike /auth/callback (which is SuperAdmin-only and gates /admin), this lets ANY 1775 player in
 * and lands them on their library at /account. Handles both the PKCE `code` (OAuth) and the
 * `token_hash`+`type` (email magic-link) shapes.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const rawNext = searchParams.get('next') || '/account'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account'

  const supabase = await createSupabaseServerClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, SITE_URL))
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(new URL(next, SITE_URL))
  }

  return NextResponse.redirect(new URL('/account/login?error=1', SITE_URL))
}
