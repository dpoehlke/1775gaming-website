/**
 * POST /api/admin/players/[id]/action
 * Moderation actions against a player profile (player_profiles.id).
 * Body: { action, value?, reason? }
 * Actions: suspend | unsuspend | ban | unban | set_tier | set_tier_timed
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'

async function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, value, reason } = await req.json() as {
    action: string
    value?: string
    reason?: string
  }

  const { id: profileId } = await params

  if (action === 'set_tier_timed') {
    // value = "TIER:ISO_DATE" e.g. "2:2026-12-31T00:00:00Z"
    const [tierStr, expires] = (value ?? '').split(':')
    const tier = parseInt(tierStr, 10)
    if (isNaN(tier) || tier < 0 || tier > 4) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }
    const { error } = await omniverseAdmin
      .from('player_profiles')
      .update({ whitelist_tier: tier, whitelist_expires: expires ?? null })
      .eq('id', profileId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // All other actions route through the superadmin_action RPC
  const { data, error } = await omniverseAdmin.rpc('superadmin_action', {
    p_action: action,
    p_target_id: profileId,
    p_value: value ?? null,
    p_reason: reason ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
