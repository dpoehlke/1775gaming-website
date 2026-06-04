/**
 * /admin/players — game player management.
 * Server Component with client-side interactivity.
 */
import { createClient } from '@supabase/supabase-js'
import PlayersClient from './PlayersClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function PlayersPage() {
  const { data, error } = await supabaseAdmin
    .from('player_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        PLAYER MANAGEMENT
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>
        {error ? 'player_profiles table not found — create it in Supabase first' : `${data?.length ?? 0} registered players`}
      </p>

      {error ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#444', marginBottom: '8px' }}>TABLE NOT YET CREATED</div>
          <div style={{ color: '#666', fontSize: '13px' }}>Create the <code style={{ color: '#B8860B' }}>player_profiles</code> table in Supabase to manage game players here.</div>
        </div>
      ) : (
        <PlayersClient initialData={data ?? []} />
      )}
    </div>
  )
}
