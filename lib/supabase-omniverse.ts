/**
 * Service-role Supabase client for the Omniverse game project.
 * Used server-side only — never import this in client components.
 *
 * Lazily constructed: the client is built on first property access (at request
 * time), not at module import. This keeps `next build` (and any preview without
 * the OMNIVERSE_* env set) from crashing during "collect page data" just because
 * ~a dozen admin routes import this module. The env is still required at runtime
 * — a route that actually uses the client without it throws when handling the
 * request, not when the bundle is built.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getOmniverseAdmin(): SupabaseClient {
  if (_client) return _client
  const url = process.env.OMNIVERSE_SUPABASE_URL
  const key = process.env.OMNIVERSE_SERVICE_ROLE_KEY
  if (!url) throw new Error('[supabase-omniverse] OMNIVERSE_SUPABASE_URL is not set')
  if (!key) throw new Error('[supabase-omniverse] OMNIVERSE_SERVICE_ROLE_KEY is not set')
  _client = createClient(url, key)
  return _client
}

// A transparent proxy so existing call sites keep using `omniverseAdmin.from(...)`
// etc. unchanged; the real client is created on the first property access.
export const omniverseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getOmniverseAdmin()
    const value = Reflect.get(client as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
