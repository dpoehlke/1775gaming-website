/**
 * /api/admin/items/sales
 * GET    ?item_type=nothebys|store  — list all sales (active + past)
 * POST   { item_id, item_type, item_name, discount_percent, ends_at, label? }
 * DELETE { id }  — end sale immediately (sets ends_at = now)
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'

async function auth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function GET(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const itemType = searchParams.get('item_type')

  let q = omniverseAdmin.from('item_sales').select('*').order('created_at', { ascending: false })
  if (itemType) q = q.eq('item_type', itemType) as typeof q

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { item_id, item_type, item_name, discount_percent, ends_at, label, starts_at } = body

  if (!item_id || !item_type || !item_name) {
    return NextResponse.json({ error: 'item_id, item_type, and item_name required' }, { status: 400 })
  }
  if (!discount_percent || discount_percent < 1 || discount_percent > 99) {
    return NextResponse.json({ error: 'discount_percent must be 1–99' }, { status: 400 })
  }
  if (!ends_at) return NextResponse.json({ error: 'ends_at required' }, { status: 400 })

  const { data, error } = await omniverseAdmin
    .from('item_sales')
    .insert({ item_id, item_type, item_name, discount_percent, ends_at, label: label ?? null, starts_at: starts_at ?? new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await omniverseAdmin
    .from('item_sales')
    .update({ ends_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
