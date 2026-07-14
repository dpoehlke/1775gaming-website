/**
 * GET /api/admin/items/templates
 * The Omniverse item catalog, used by admins to grant items to a character.
 * Optional ?rarity=<loot tier> filter. Sorted by loot tier, then name.
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'
import { RARITY_ORDER, rarityRank, type Rarity } from '@/lib/omniverse-loot'

async function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rarity = new URL(req.url).searchParams.get('rarity')
  if (rarity && !RARITY_ORDER.includes(rarity as Rarity)) {
    return NextResponse.json({ error: `Unknown loot tier: ${rarity}` }, { status: 400 })
  }

  let query = omniverseAdmin
    .from('item_templates')
    .select('id, name, description, rarity, slot, item_type, effects, is_container')
  if (rarity) query = query.eq('rarity', rarity)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const sorted = (data ?? []).sort(
    (a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name),
  )
  return NextResponse.json(sorted)
}
