/**
 * Generic admin data API — GET list, POST create.
 * Supports ?project=omniverse to route to the Omniverse game project.
 * Protected by admin session cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, verifyAdminSession, isTableAllowed } from '@/lib/admin-db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  if (!await verifyAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table } = await params
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  if (!isTableAllowed(table, project)) return NextResponse.json({ error: 'Forbidden' }, { status: 400 })
  const order = searchParams.get('order')
  const limit = searchParams.get('limit')
  const filter = searchParams.get('filter') // col=eq.val
  const select = searchParams.get('select') ?? '*'

  const db = getAdminClient(project)
  let query = db.from(table).select(select)
  if (order) { const [col, dir] = order.split('.'); query = query.order(col, { ascending: dir !== 'desc' }) }
  if (limit) query = query.limit(parseInt(limit))
  if (filter) {
    const eqIdx = filter.indexOf('=')
    const col = filter.slice(0, eqIdx)
    const rest = filter.slice(eqIdx + 1)
    const dotIdx = rest.indexOf('.')
    const op = rest.slice(0, dotIdx)
    const val = rest.slice(dotIdx + 1)
    if (op === 'eq') query = query.eq(col, val)
    if (op === 'neq') query = query.neq(col, val)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  if (!await verifyAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table } = await params
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  if (!isTableAllowed(table, project)) return NextResponse.json({ error: 'Forbidden' }, { status: 400 })
  const db = getAdminClient(project)
  const body = await request.json()
  const { data, error } = await db.from(table).insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
