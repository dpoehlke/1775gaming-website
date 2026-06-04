/**
 * /admin/beta-signups — view and manage all beta signup applications.
 * Server Component. Auth enforced by middleware.
 */
import { createClient } from '@supabase/supabase-js'
import BetaSignupsClient from './BetaSignupsClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function BetaSignupsPage() {
  const { data, error } = await supabaseAdmin
    .from('beta_signups')
    .select('*')
    .order('created_at', { ascending: false })

  const signups = data ?? []

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        BETA PIONEER APPLICATIONS
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>
        {error ? 'Error loading data — check service role key' : `${signups.length} total applications`}
      </p>

      {error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', padding: '20px', borderRadius: '8px', color: '#CC4444' }}>
          Supabase error: {error.message}
        </div>
      ) : (
        <BetaSignupsClient initialData={signups} />
      )}
    </div>
  )
}
