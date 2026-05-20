/**
 * Next.js middleware — SuperAdmin-only /admin/* gate.
 *
 * Any request to /admin/* that is NOT the SuperAdmin
 * is redirected to /admin/login (unauthenticated) or
 * to / (wrong account) with no explanation.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPERADMIN_UID = 'a4e1c087-2f83-4f94-9ec6-113121c744a1'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pass-through: not an admin route
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  // Pass-through: login page itself (avoid redirect loop)
  if (pathname === '/admin/login') return NextResponse.next()

  // Build a response object so @supabase/ssr can refresh session cookies
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set(name, '', options as Parameters<typeof response.cookies.set>[2])
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // No session — redirect to login, preserving the intended destination
  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated but NOT the SuperAdmin — silent redirect to homepage
  if (session.user.id !== SUPERADMIN_UID) {
    console.warn(
      `[security] Unauthorized admin access: ${session.user.email} (${session.user.id}) → ${pathname}`
    )
    return NextResponse.redirect(new URL('/', request.url))
  }

  // SuperAdmin confirmed — pass through with refreshed session cookies
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
