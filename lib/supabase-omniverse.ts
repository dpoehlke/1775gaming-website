/**
 * Service-role Supabase client for the Omniverse game project.
 * Used server-side only — never import this in client components.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.OMNIVERSE_SUPABASE_URL
const key = process.env.OMNIVERSE_SERVICE_ROLE_KEY

if (!url) throw new Error('[supabase-omniverse] OMNIVERSE_SUPABASE_URL is not set')
if (!key) throw new Error('[supabase-omniverse] OMNIVERSE_SERVICE_ROLE_KEY is not set')

export const omniverseAdmin = createClient(url, key)
