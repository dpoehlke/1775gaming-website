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
    <div style={{ background: '#0D0D0D', minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        background: '#1A1A1A', borderBottom: '2px solid #CC0000',
        padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/admin" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>← Command Center</a>
          <span style={{ color: '#333' }}>|</span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#CC0000', letterSpacing: '0.1em' }}>
            BETA SIGNUPS
          </span>
        </div>
        <a href="/admin/signout" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Sign out</a>
      </div>

      <div style={{ padding: '40px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', color: 'white', margin: '0 0 8px' }}>
          BETA PIONEER APPLICATIONS
        </h1>
        <p style={{ color: '#C0C0C0', margin: '0 0 32px' }}>
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
    </div>
  )
}
