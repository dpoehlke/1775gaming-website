/**
 * GET /api/admin/players/[id]/characters
 * Returns all characters + inventory for a player profile (player_profiles.id).
 *
 * Each inventory item carries a server-computed `flags` array explaining
 * exactly why it looks inauthentic (see lib/omniverse-loot).
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'
import { flagItem, type CatalogEntry } from '@/lib/omniverse-loot'

async function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { data: characters, error: charErr } = await omniverseAdmin
    .from('characters')
    .select('id, name, hero_name, archetype, power_level, total_power_points, abilities, skills, advantages, powers, defenses, offense, equipment, status, is_villain, hero_points, created_at')
    .eq('player_id', id)
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

  // Item catalog: every table that defines a legitimate item. Names absent from
  // all of them (crafting materials, generated caches, code-defined store items)
  // are simply unverifiable, not suspicious — see flagItem.
  const [templates, magical, mundane] = await Promise.all([
    omniverseAdmin.from('item_templates').select('name, rarity, effects'),
    omniverseAdmin.from('magical_loot').select('name, rarity'),
    omniverseAdmin.from('mundane_loot').select('name, rarity'),
  ])
  const catErr = templates.error ?? magical.error ?? mundane.error
  if (catErr) return NextResponse.json({ error: catErr.message }, { status: 500 })

  const catalog = new Map<string, CatalogEntry>()
  for (const t of templates.data ?? []) {
    catalog.set(t.name.trim().toLowerCase(), { rarity: t.rarity, effects: t.effects ?? [] })
  }
  // Loot tables define rarity but not effects — record them without clobbering
  // a richer item_templates entry for the same name.
  for (const l of [...(magical.data ?? []), ...(mundane.data ?? [])]) {
    const key = l.name.trim().toLowerCase()
    if (!catalog.has(key)) catalog.set(key, { rarity: l.rarity, effects: null })
  }

  // Group inventory by character, attaching flags
  const invByChar: Record<string, unknown[]> = {}
  for (const item of items ?? []) {
    if (!invByChar[item.character_id]) invByChar[item.character_id] = []
    invByChar[item.character_id]!.push({
      ...item,
      flags: flagItem(
        {
          name: item.name,
          rarity: item.rarity,
          source: item.source,
          type: item.type,
          quantity: item.quantity,
          effects: (item.effects ?? []) as unknown[],
        },
        catalog,
      ),
    })
  }

  const result = characters.map(c => ({
    ...c,
    inventory: invByChar[c.id] ?? [],
  }))

  return NextResponse.json(result)
}
