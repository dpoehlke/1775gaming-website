/**
 * GET /admin/signout
 * Signs the SuperAdmin out and redirects to the homepage.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.1775gaming.com'
  return NextResponse.redirect(new URL('/', siteUrl))
}
