/**
 * GET /admin/signout
 * Clears the admin session cookie and redirects to the homepage.
 */
import { ADMIN_COOKIE } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'
  const response = NextResponse.redirect(new URL('/', siteUrl))

  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   0,   // delete immediately
    path:     '/',
  })

  return response
}
