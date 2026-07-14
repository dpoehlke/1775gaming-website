/**
 * POST /api/admin/players/[id]/action
 * Moderation actions against a player profile (player_profiles.id).
 * Body: { action, value?, reason? }
 * Actions: suspend | unsuspend | ban | unban | set_tier | set_tier_timed
 *          adjust_credits | adjust_character_points
 *
 * The adjust_* actions take a signed delta in `value` (e.g. "500", "-250"),
 * clamp the result at zero, and record the change in audit_log. Omni credits
 * and character points are player-level balances, not per-character.
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

  // Balance adjustments return the new balance, so they short-circuit the switch.
  if (action === 'adjust_credits' || action === 'adjust_character_points') {
    const column = action === 'adjust_credits' ? 'omni_credits' : 'character_points_bank'
    const delta = Number(value)
    if (!Number.isFinite(delta) || !Number.isInteger(delta) || delta === 0) {
      return NextResponse.json({ error: 'Amount must be a non-zero whole number' }, { status: 400 })
    }

    const { data: profile, error: readErr } = await omniverseAdmin
      .from('player_profiles')
      .select(`id, ${column}`)
      .eq('id', profileId)
      .maybeSingle<Record<string, number>>()
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
    if (!profile) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

    const before = profile[column] ?? 0
    const after = Math.max(0, before + delta)

    const { error: writeErr } = await omniverseAdmin
      .from('player_profiles')
      .update({ [column]: after })
      .eq('id', profileId)
    if (writeErr) return NextResponse.json({ error: writeErr.message }, { status: 500 })

    await omniverseAdmin.from('audit_log').insert({
      action,
      target_type: 'player_profile',
      target_id: profileId,
      payload: {
        field: column,
        delta,
        balance_before: before,
        balance_after: after,
        // Set when the requested debit exceeded the balance and was floored at 0.
        clamped: before + delta < 0,
        reason: reason ?? null,
        via: 'admin_players_page',
      },
    })

    return NextResponse.json({ ok: true, field: column, before, after })
  }

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
