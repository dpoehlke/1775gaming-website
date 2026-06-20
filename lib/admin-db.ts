/**
 * Shared helpers for admin data API routes.
 * Server-side only — never import in client components.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { verifySession, ADMIN_COOKIE } from '@/lib/admin-auth'

// Explicit allowlist — prevents arbitrary table access via URL params.
// 1775 site tables (default project)
const SITE_TABLES = new Set([
  'beta_signups', 'newsletter_subscribers', 'mission_routes',
  'store_items', 'nothebys_items', 'contact_messages',
  'encounter_sessions', 'nothebys_purchases', 'auction_listings',
  'item_sales', 'purchases', 'subscription_sales',
])
// Omniverse game tables (omniverse project)
const OMNIVERSE_TABLES = new Set([
  'campaigns', 'player_profiles', 'pvp_ratings', 'pvp_matches',
  'characters', 'absolute_rules', 'pvp_queue', 'arenas',
  'character_power_tally',
])

export function isTableAllowed(table: string, project?: string | null): boolean {
  if (project === 'omniverse') return OMNIVERSE_TABLES.has(table)
  return SITE_TABLES.has(table)
}

export function getAdminClient(project?: string | null): SupabaseClient {
  if (project === 'omniverse') {
    const url = process.env.OMNIVERSE_SUPABASE_URL
    const key = process.env.OMNIVERSE_SERVICE_ROLE_KEY
    if (!url) throw new Error('OMNIVERSE_SUPABASE_URL is not set')
    if (!key) throw new Error('OMNIVERSE_SERVICE_ROLE_KEY is not set')
    return createClient(url, key)
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  return createClient(url, key)
}

export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  return verifySession(token, process.env.ADMIN_SESSION_SECRET ?? '')
}
