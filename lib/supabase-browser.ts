/**
 * Browser Supabase client (cookie-aware via @supabase/ssr) for the player-facing
 * "1775 account" — sign-in, session, and reads from client components.
 *
 * Uses the WEBSITE project (NEXT_PUBLIC_SUPABASE_URL). This is separate from `lib/supabase.ts`
 * (a plain, non-SSR client used for simple public reads) and from the admin auth, which is
 * username/password cookie based.
 */
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
