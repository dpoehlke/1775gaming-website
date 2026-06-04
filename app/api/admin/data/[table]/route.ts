/**
 * Generic admin data API — GET list, POST create.
 * Protected by admin session cookie.
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function auth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function GET(request: NextRequest, { params }: { params: { table: string } }) {
  if (!await auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const order = searchParams.get('order') // e.g. "created_at.desc"
  const limit = searchParams.get('limit')
  const filter = searchParams.get('filter') // e.g. "status=eq.active"

  let query = supabaseAdmin.from(params.table).select('*')
  if (order) {
    const [col, dir] = order.split('.')
    query = query.order(col, { ascending: dir !== 'desc' })
  }
  if (limit) query = query.limit(parseInt(limit))
  if (filter) {
    const [col, op_val] = filter.split('=')
    const [op, val] = op_val.split('.')
    if (op === 'eq') query = query.eq(col, val)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: { table: string } }) {
  if (!await auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabaseAdmin.from(params.table).insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
