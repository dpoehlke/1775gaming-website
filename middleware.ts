/**
 * Next.js middleware — SuperAdmin-only /admin/* gate.
 *
 * Checks a signed httpOnly cookie (set by POST /api/admin/auth).
 * No Supabase session is involved — pure username/password auth.
 */
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pass-through: not an admin route
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Pass-through: login page itself (avoid redirect loop)
  if (pathname === '/admin/login') return NextResponse.next()

  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  const token  = request.cookies.get(ADMIN_COOKIE)?.value
  const valid  = await verifySession(token, secret)

  if (!valid) {
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
