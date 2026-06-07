/**
 * /api/admin/subscriptions/sales
 * GET  — list all sales (active and past)
 * POST — create a sale { tier?, discount_percent, starts_at, ends_at, label? }
 * DELETE — { id } — cancel a sale by id
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
  const { data, error } = await omniverseAdmin
    .from('subscription_sales')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { tier, discount_percent, starts_at, ends_at, label } = body

  if (!discount_percent || discount_percent < 1 || discount_percent > 99) {
    return NextResponse.json({ error: 'discount_percent must be 1–99' }, { status: 400 })
  }
  if (!ends_at) return NextResponse.json({ error: 'ends_at required' }, { status: 400 })

  const { data, error } = await omniverseAdmin
    .from('subscription_sales')
    .insert({
      tier: tier ?? null,
      discount_percent,
      starts_at: starts_at ?? new Date().toISOString(),
      ends_at,
      label: label ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!await auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  // End the sale now rather than delete, so it shows in history
  const { error } = await omniverseAdmin
    .from('subscription_sales')
    .update({ ends_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
