/**
 * Server-side Supabase client for public content queries
 * (legal documents, etc.) in Server Components with ISR.
 *
 * Legal documents live in the Omniverse Supabase project, so this client
 * prefers the OMNIVERSE_* env vars and falls back to the website project.
 * Uses the anon key — legal_documents has a public-read RLS policy.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createClient(): SupabaseClient {
  const url =
    process.env.OMNIVERSE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.OMNIVERSE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
