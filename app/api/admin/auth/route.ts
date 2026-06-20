/**
 * POST /api/admin/auth
 *
 * Verifies username + password against env vars.
 * Password is stored as "sha256:<hex-salt>:<hex-digest>" in ADMIN_PASSWORD_HASH.
 * On success sets a signed httpOnly session cookie.
 * On failure waits 500 ms before responding (slows brute force).
 */
import { createSession, ADMIN_COOKIE, SESSION_MAX_AGE } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'

function verifyPassword(candidate: string, stored: string): boolean {
  // stored format: "sha256:<hex-salt>:<hex-digest>"
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'sha256') return false
  const [, salt, expected] = parts
  const actual = createHash('sha256').update(salt + candidate).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  let username = '', password = ''
  try {
    const body = await request.json()
    username = body.username ?? ''
    password = body.password ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH ?? ''
  const validUser = timingSafeEqual(
    Buffer.from(username.padEnd(64)),
    Buffer.from((process.env.ADMIN_USERNAME ?? '').padEnd(64)),
  )
  const validPass = storedHash ? verifyPassword(password, storedHash) : false

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
