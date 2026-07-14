/**
 * Admin item grants and removals against a character's inventory.
 *
 * POST   /api/admin/players/[id]/characters/[charId]/inventory  → grant an item
 * DELETE /api/admin/players/[id]/characters/[charId]/inventory  → remove an item
 *
 * Granted items are instantiated from an item_templates row so they match the
 * catalog and do not trip the authenticity flags. `source` is set to 'reward'
 * because inventory_items_source_check has no admin value; the authoritative
 * record that an admin granted it lives in audit_log.
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'
import { VALID_SLOTS } from '@/lib/omniverse-loot'

async function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

/** Confirms the character actually belongs to this player profile. */
async function assertOwnership(profileId: string, charId: string) {
  const { data, error } = await omniverseAdmin
    .from('characters')
    .select('id')
    .eq('id', charId)
    .eq('player_id', profileId)
    .maybeSingle()
  if (error) return { ok: false as const, res: NextResponse.json({ error: error.message }, { status: 500 }) }
  if (!data) return { ok: false as const, res: NextResponse.json({ error: 'Character does not belong to this player' }, { status: 404 }) }
  return { ok: true as const }
}

async function audit(action: string, charId: string, payload: Record<string, unknown>) {
  await omniverseAdmin.from('audit_log').insert({
    action,
    target_type: 'character',
    target_id: charId,
    payload: { ...payload, via: 'admin_players_page' },
  })
}

// ── Grant ─────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> },
) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: profileId, charId } = await params

  const owns = await assertOwnership(profileId, charId)
  if (!owns.ok) return owns.res

  const { templateId, quantity, reason } = await req.json() as {
    templateId?: string; quantity?: number; reason?: string
  }
  if (!templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 })

  const qty = Math.floor(Number(quantity ?? 1))
  if (!Number.isFinite(qty) || qty < 1 || qty > 999) {
    return NextResponse.json({ error: 'Quantity must be between 1 and 999' }, { status: 400 })
  }

  const { data: tpl, error: tplErr } = await omniverseAdmin
    .from('item_templates')
    .select('id, name, description, rarity, slot, item_type, effects, is_container')
    .eq('id', templateId)
    .maybeSingle()
  if (tplErr) return NextResponse.json({ error: tplErr.message }, { status: 500 })
  if (!tpl) return NextResponse.json({ error: 'Item template not found' }, { status: 404 })

  const slot = VALID_SLOTS.includes(tpl.slot as typeof VALID_SLOTS[number]) ? tpl.slot : 'none'

  const { data: created, error } = await omniverseAdmin
    .from('inventory_items')
    .insert({
      character_id: charId,
      name: tpl.name,
      description: tpl.description,
      type: tpl.item_type,
      rarity: tpl.rarity,
      slot,
      effects: tpl.effects ?? [],
      quantity: qty,
      source: 'reward',
      equipped: false,
      is_container: tpl.is_container ?? false,
    })
    .select('id, character_id, name, type, rarity, source, quantity, equipped, slot, effects, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await audit('admin_grant_item', charId, {
    player_profile_id: profileId,
    item_id: created.id,
    template_id: tpl.id,
    item_name: tpl.name,
    rarity: tpl.rarity,
    quantity: qty,
    reason: reason ?? null,
  })

  return NextResponse.json({ ...created, flags: [] }, { status: 201 })
}

// ── Remove ────────────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> },
) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: profileId, charId } = await params

  const owns = await assertOwnership(profileId, charId)
  if (!owns.ok) return owns.res

  const { itemId, quantity, reason } = await req.json() as {
    itemId?: string; quantity?: number; reason?: string
  }
  if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 })

  const { data: item, error: itemErr } = await omniverseAdmin
    .from('inventory_items')
    .select('id, name, rarity, quantity')
    .eq('id', itemId)
    .eq('character_id', charId)
    .maybeSingle()
  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 })
  if (!item) return NextResponse.json({ error: 'Item not found on this character' }, { status: 404 })

  // No quantity given (or it covers the whole stack) → remove the item outright.
  const take = quantity == null ? item.quantity : Math.floor(Number(quantity))
  if (!Number.isFinite(take) || take < 1) {
    return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
  }

  const removedWhole = take >= item.quantity
  if (removedWhole) {
    const { error } = await omniverseAdmin.from('inventory_items').delete().eq('id', itemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await omniverseAdmin
      .from('inventory_items')
      .update({ quantity: item.quantity - take })
      .eq('id', itemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await audit('admin_remove_item', charId, {
    player_profile_id: profileId,
    item_id: itemId,
    item_name: item.name,
    rarity: item.rarity,
    quantity_removed: removedWhole ? item.quantity : take,
    item_deleted: removedWhole,
    reason: reason ?? null,
  })

  return NextResponse.json({
    ok: true,
    deleted: removedWhole,
    remaining: removedWhole ? 0 : item.quantity - take,
  })
}
