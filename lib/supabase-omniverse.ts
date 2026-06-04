/**
 * Service-role Supabase client for the Omniverse game project.
 * Used server-side only — never import this in client components.
 */
import { createClient } from '@supabase/supabase-js'

if (!process.env.OMNIVERSE_SUPABASE_URL) {
  console.warn('[supabase-omniverse] OMNIVERSE_SUPABASE_URL is not set')
}
if (!process.env.OMNIVERSE_SERVICE_ROLE_KEY) {
  console.warn('[supabase-omniverse] OMNIVERSE_SERVICE_ROLE_KEY is not set')
}

export const omniverseAdmin = createClient(
  process.env.OMNIVERSE_SUPABASE_URL ?? 'https://vduwwzudizksjwtvjnfr.supabase.co',
  process.env.OMNIVERSE_SERVICE_ROLE_KEY ?? '',
)
