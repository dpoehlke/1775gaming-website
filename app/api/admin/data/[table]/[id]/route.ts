/**
 * Generic admin data API — GET single, PATCH update, DELETE.
 * Supports ?project=omniverse to route to the Omniverse game project.
 * Protected by admin session cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, verifyAdminSession, isTableAllowed } from '@/lib/admin-db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ table: string; id: string }> }) {
  if (!await verifyAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table, id } = await params
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  if (!isTableAllowed(table, project)) return NextResponse.json({ error: 'Forbidden' }, { status: 400 })
  const { data, error } = await getAdminClient(project).from(table).select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ table: string; id: string }> }) {
  if (!await verifyAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table, id } = await params
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  if (!isTableAllowed(table, project)) return NextResponse.json({ error: 'Forbidden' }, { status: 400 })
  const body = await request.json()
  const { error } = await getAdminClient(project).from(table).update(body).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ table: string; id: string }> }) {
  if (!await verifyAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { table, id } = await params
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  if (!isTableAllowed(table, project)) return NextResponse.json({ error: 'Forbidden' }, { status: 400 })
  const { error } = await getAdminClient(project).from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
