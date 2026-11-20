/**
 * POST /api/membership/select — set a Basic-tier member's chosen games (the "pick 3").
 * The /account game-picker form posts `game` (one per selected game id). The RPC enforces the
 * rules: Basic tier only, at most 3 basic games, changeable once every 30 days.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/account/login', SITE_URL), { status: 303 })

  const form = await req.formData()
  const games = form.getAll('game').map(String).filter(Boolean)

  const { error } = await supabase.rpc('set_membership_selections', { p_games: games })
  if (error) {
    const url = new URL('/account', SITE_URL)
    url.searchParams.set('select', 'error')
    url.searchParams.set('msg', error.message.slice(0, 200))
    return NextResponse.redirect(url, { status: 303 })
  }
  return NextResponse.redirect(new URL('/account?select=success', SITE_URL), { status: 303 })
}
