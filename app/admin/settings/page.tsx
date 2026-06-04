/**
 * /admin/settings — Admin settings and configuration.
 * Server Component.
 */
export default function SettingsPage() {
  const envOk = (key: string) => !!(process.env[key])
  const checks = [
    { label: 'NEXT_PUBLIC_SUPABASE_URL', ok: envOk('NEXT_PUBLIC_SUPABASE_URL') },
    { label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', ok: envOk('NEXT_PUBLIC_SUPABASE_ANON_KEY') },
    { label: 'SUPABASE_SERVICE_ROLE_KEY', ok: envOk('SUPABASE_SERVICE_ROLE_KEY') },
    { label: 'ADMIN_SESSION_SECRET', ok: envOk('ADMIN_SESSION_SECRET') },
    { label: 'ADMIN_USERNAME', ok: envOk('ADMIN_USERNAME') },
    { label: 'ADMIN_PASSWORD_HASH', ok: envOk('ADMIN_PASSWORD_HASH') },
  ]

  const section: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px', marginBottom: '16px' }
  const sTitle: React.CSSProperties = { fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#B8860B', letterSpacing: '0.08em', marginBottom: '16px' }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', maxWidth: '700px' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>SETTINGS</h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>Admin configuration and environment status</p>

      {/* Environment checks */}
      <div style={section}>
        <div style={sTitle}>ENVIRONMENT VARIABLES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checks.map(({ label, ok }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ color: ok ? '#00AA44' : '#CC0000', fontSize: '16px' }}>{ok ? '✓' : '✗'}</span>
              <code style={{ color: ok ? '#C0C0C0' : '#CC6666', fontSize: '13px', flex: 1 }}>{label}</code>
              <span style={{ color: ok ? '#00AA44' : '#CC0000', fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>{ok ? 'SET' : 'MISSING'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin routes reference */}
      <div style={section}>
        <div style={sTitle}>ADMIN ROUTES</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { path: '/admin', label: 'Dashboard', status: 'live' },
            { path: '/admin/beta-signups', label: 'Beta Signups', status: 'live' },
            { path: '/admin/newsletter', label: 'Newsletter', status: 'live' },
            { path: '/admin/gpx', label: 'GPX Upload', status: 'live' },
            { path: '/admin/players', label: 'Players', status: 'needs table' },
            { path: '/admin/campaigns', label: 'Campaigns', status: 'needs table' },
            { path: '/admin/store', label: 'Store Items', status: 'needs table' },
            { path: '/admin/subscriptions', label: 'Subscriptions', status: 'live' },
            { path: '/admin/analytics', label: 'Analytics', status: 'live' },
            { path: '/admin/world-lore', label: 'World Lore', status: 'needs table' },
            { path: '/admin/support', label: 'Support Tickets', status: 'needs table' },
            { path: '/admin/fafo', label: 'FAFO Encounters', status: 'needs table' },
            { path: '/admin/pawnshop', label: "Pete's Pawn Shop", status: 'needs table' },
            { path: '/admin/auction', label: "Notheby's Auction", status: 'needs table' },
          ].map(({ path, label, status }) => (
            <div key={path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px solid #1F1F1F' }}>
              <code style={{ color: '#888', fontSize: '12px', width: '220px', flexShrink: 0 }}>{path}</code>
              <span style={{ color: '#C0C0C0', fontSize: '12px', flex: 1 }}>{label}</span>
              <span style={{ color: status === 'live' ? '#00AA44' : '#B8860B', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif' }}>
                {status === 'live' ? 'LIVE' : 'NEEDS TABLE'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Game tables needed */}
      <div style={section}>
        <div style={sTitle}>SUPABASE TABLES TO CREATE</div>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>These tables need to be created in your Supabase project to enable the game management features:</p>
        {[
          { name: 'player_profiles', cols: 'id, display_name, created_by (email), subscription_tier, caps_remaining, caps_daily_limit, whitelist_tier, whitelist_expires, created_at' },
          { name: 'campaigns', cols: 'id, title, description, status, difficulty, power_level, min_tier, player_count, estimated_chapters, is_origin_campaign, world_info, overarching_story, ai_instructions, chapters (jsonb), created_at' },
          { name: 'store_items', cols: 'id, name, description, category, price, price_type, active, is_permanent, created_at' },
          { name: 'world_lore', cols: 'id, universe_overview, history_and_origin, geography, factions, technology_and_magic, tone_and_themes, ai_gm_instructions, key_npcs (jsonb), key_locations (jsonb), lore_tags (jsonb), updated_at' },
          { name: 'support_tickets', cols: 'id, subject, category, priority, status, player_display_name, player_email, messages (jsonb), created_date, resolved_at' },
          { name: 'encounter_sessions', cols: 'id, character_name, encounter_title, difficulty_tier, success, is_crit_success, is_crit_fail, rewards_currency, rewards_caps, rewards_loot_name, encounter_date' },
          { name: 'pawn_sales', cols: 'id, item_name, item_rarity, item_type, oc_received, market_multiplier, campaign_chapter, created_date' },
          { name: 'auction_listings', cols: 'id, item_name, item_rarity, status, asking_price, seller_name, seller_id, buyer_name, sold_at, created_date, updated_date' },
        ].map(({ name, cols }) => (
          <div key={name} style={{ marginBottom: '12px', padding: '12px', background: '#111', borderRadius: '6px', border: '1px solid #2A2A2A' }}>
            <code style={{ color: '#CC0000', fontSize: '13px', fontWeight: 600 }}>{name}</code>
            <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0', lineHeight: 1.5 }}>{cols}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
