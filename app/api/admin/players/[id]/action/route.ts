/**
 * POST /api/admin/players/[id]/action
 * Moderation actions against a player profile (player_profiles.id).
 * Body: { action, value?, reason? }
 * Actions: suspend | unsuspend | ban | unban | set_tier | set_tier_timed
 *
 * All mutations are direct table updates via the service-role client rather
 * than the superadmin_action RPC. The RPC's is_superadmin() check relies on
 * auth.uid() which is NULL for service-role callers, so we bypass it here.
 * Security is enforced by verifySession() at the HTTP layer.
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
  let error: { message: string } | null = null

  switch (action) {
    case 'suspend': {
      const hours = parseInt(value ?? '24', 10)
      if (isNaN(hours) || hours < 1) return NextResponse.json({ error: 'Invalid hours' }, { status: 400 });
      ({ error } = await omniverseAdmin.from('player_profiles').update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspension_reason: reason ?? null,
        suspension_expires_at: new Date(Date.now() + hours * 3_600_000).toISOString(),
      }).eq('id', profileId))
      break
    }
    case 'unsuspend':
      ({ error } = await omniverseAdmin.from('player_profiles').update({
        is_suspended: false,
        suspended_at: null,
        suspension_reason: null,
        suspension_expires_at: null,
      }).eq('id', profileId))
      break

    case 'ban':
      if (!reason?.trim()) return NextResponse.json({ error: 'Ban reason required' }, { status: 400 });
      ({ error } = await omniverseAdmin.from('player_profiles').update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        ban_reason: reason,
      }).eq('id', profileId))
      break

    case 'unban':
      ({ error } = await omniverseAdmin.from('player_profiles').update({
        is_banned: false,
        banned_at: null,
        ban_reason: null,
      }).eq('id', profileId))
      break

    case 'set_tier': {
      const tier = parseInt(value ?? '', 10)
      if (isNaN(tier) || tier < 0 || tier > 4) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      ({ error } = await omniverseAdmin.from('player_profiles').update({
        subscription_tier: tier,
      }).eq('id', profileId))
      break
    }
    case 'set_tier_timed': {
      // value = "TIER:ISO_DATE" e.g. "2:2026-12-31T00:00:00Z"
      const [tierStr, ...rest] = (value ?? '').split(':')
      const expires = rest.join(':')  // re-join in case ISO date contains colons
      const tier = parseInt(tierStr, 10)
      if (isNaN(tier) || tier < 0 || tier > 4) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      ({ error } = await omniverseAdmin.from('player_profiles').update({
        whitelist_tier: tier,
        whitelist_expires: expires || null,
      }).eq('id', profileId))
      break
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
