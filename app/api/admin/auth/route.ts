/**
 * POST /api/admin/auth
 *
 * Verifies username + password against env vars.
 * On success sets a signed httpOnly session cookie.
 * On failure waits 500 ms before responding (slows brute force).
 */
import { createSession, ADMIN_COOKIE, SESSION_MAX_AGE } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let username = '', password = ''
  try {
    const body = await request.json()
    username = body.username ?? ''
    password = body.password ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const validUser = username === process.env.ADMIN_USERNAME
  const validPass = password === process.env.ADMIN_PASSWORD

  if (!validUser || !validPass) {
    await new Promise((r) => setTimeout(r, 500)) // rate-limit hint
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    console.error('[admin-auth] ADMIN_SESSION_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const token    = await createSession(secret)
  const response = NextResponse.json({ success: true })

  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   SESSION_MAX_AGE,
    path:     '/',
  })

  return response
}
