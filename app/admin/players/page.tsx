/**
 * /admin/players — Omniverse player management.
 * Server Component → Omniverse project.
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import PlayersClient from './PlayersClient'

export default async function PlayersPage() {
  const { data, error } = await omniverseAdmin
    .from('player_profiles')
    .select('id, user_id, display_name, subscription_tier, caps_remaining, caps_daily_limit, omni_credits, character_points_bank, victory_points, max_characters, whitelist_tier, whitelist_expires, is_banned, ban_reason, is_suspended, suspension_expires_at, super_group_id, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        PLAYER MANAGEMENT
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>
        {error ? `Omniverse DB error: ${error.message}` : `${data?.length ?? 0} registered players`}
      </p>
      {error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', padding: '20px', borderRadius: '8px', color: '#CC4444' }}>
          {error.code === 'PGRST301' || error.message.includes('JWT')
            ? 'OMNIVERSE_SERVICE_ROLE_KEY not set — add it to .env.local and Vercel env vars.'
            : error.message}
        </div>
      ) : (
        <PlayersClient initialData={data ?? []} />
      )}
    </div>
  )
}
