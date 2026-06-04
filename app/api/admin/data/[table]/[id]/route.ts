/**
 * Generic admin data API — GET single, PATCH update, DELETE.
 * Supports ?project=omniverse to route to the Omniverse game project.
 * Protected by admin session cookie.
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'

function getClient(project?: string | null) {
  if (project === 'omniverse') {
    return createClient(
      process.env.OMNIVERSE_SUPABASE_URL ?? 'https://vduwwzudizksjwtvjnfr.supabase.co',
      process.env.OMNIVERSE_SERVICE_ROLE_KEY ?? '',
    )
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function auth(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}

export async function GET(request: NextRequest, { params }: { params: { table: string; id: string } }) {
  if (!await auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const { data, error } = await getClient(searchParams.get('project')).from(params.table).select('*').eq('id', params.id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: { table: string; id: string } }) {
  if (!await auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const body = await request.json()
  const { error } = await getClient(searchParams.get('project')).from(params.table).update(body).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { table: string; id: string } }) {
  if (!await auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const { error } = await getClient(searchParams.get('project')).from(params.table).delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
