/**
 * Supabase server client for use in Server Components,
 * Route Handlers, and Server Actions.
 *
 * Uses @supabase/ssr so session cookies are automatically
 * read from and written to Next.js request/response headers.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            // Only works in Route Handlers / Server Actions — silently skipped in
            // read-only Server Components (session is still valid for that request).
            cookieStore.set({ name, value, ...options })
          } catch { /* read-only context — safe to ignore */ }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch { /* read-only context — safe to ignore */ }
        },
      },
    }
  )
}
