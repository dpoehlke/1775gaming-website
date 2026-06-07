/**
 * GET /api/admin/players/[id]/characters
 * Returns all characters + inventory for a player profile (player_profiles.id).
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'

async function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: characters, error: charErr } = await omniverseAdmin
    .from('characters')
    .select('id, name, hero_name, archetype, power_level, total_power_points, abilities, skills, advantages, powers, defenses, offense, equipment, status, is_villain, created_at')
    .eq('player_id', params.id)
    .order('created_at', { ascending: true })

  if (charErr) return NextResponse.json({ error: charErr.message }, { status: 500 })
  if (!characters?.length) return NextResponse.json([])

  // Fetch inventory for all characters in one query
  const charIds = characters.map(c => c.id)
  const { data: items, error: invErr } = await omniverseAdmin
    .from('inventory_items')
    .select('id, character_id, name, type, rarity, source, quantity, equipped, slot, effects, created_at')
    .in('character_id', charIds)
    .order('created_at', { ascending: false })

  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  // Group inventory by character
  const invByChar: Record<string, typeof items> = {}
  for (const item of items ?? []) {
    if (!invByChar[item.character_id]) invByChar[item.character_id] = []
    invByChar[item.character_id]!.push(item)
  }

  const result = characters.map(c => ({
    ...c,
    inventory: invByChar[c.id] ?? [],
  }))

  return NextResponse.json(result)
}
