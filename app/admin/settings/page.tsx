/**
 * /admin/settings — Environment status and route reference.
 */
export default function SettingsPage() {
  const ok = (key: string) => !!(process.env[key]) && !process.env[key]?.startsWith('PASTE') && !process.env[key]?.startsWith('CHOOSE') && !process.env[key]?.startsWith('GENERATE')
  const section: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px', marginBottom: '16px' }
  const sTitle: React.CSSProperties = { fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#B8860B', letterSpacing: '0.08em', marginBottom: '16px' }

  const envGroups = [
    { title: '1775gaming.com project', vars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]},
    { title: 'Omniverse game project', vars: [
      'OMNIVERSE_SUPABASE_URL',
      'OMNIVERSE_ANON_KEY',
      'OMNIVERSE_SERVICE_ROLE_KEY',
    ]},
    { title: 'Admin auth', vars: [
      'ADMIN_USERNAME',
      'ADMIN_PASSWORD_HASH',
      'ADMIN_SESSION_SECRET',
    ]},
  ]

  const routes = [
    // Website
    { path: '/admin', label: 'Dashboard', db: '1775gaming', status: 'live' },
    { path: '/admin/beta-signups', label: 'Beta Pioneers', db: '1775gaming', status: 'live' },
    { path: '/admin/newsletter', label: 'Newsletter', db: '1775gaming', status: 'live' },
    { path: '/admin/contact', label: 'Contact Inbox', db: '1775gaming', status: 'live' },
    { path: '/admin/gpx', label: 'GPX Missions', db: '1775gaming', status: 'live' },
    // Game
    { path: '/admin/players', label: 'Players', db: 'omniverse', status: 'live' },
    { path: '/admin/campaigns', label: 'Campaigns', db: 'omniverse', status: 'live' },
    { path: '/admin/store', label: 'Store Items', db: 'omniverse', status: 'live' },
    { path: '/admin/subscriptions', label: 'Subscriptions', db: 'static', status: 'live' },
    { path: '/admin/world-lore', label: 'World Lore', db: 'omniverse', status: 'live' },
    // Operations
    { path: '/admin/analytics', label: 'Analytics', db: '1775gaming', status: 'live' },
    { path: '/admin/support', label: 'Support Tickets', db: 'omniverse', status: 'live' },
    { path: '/admin/fafo', label: 'FAFO Encounters', db: 'omniverse', status: 'live' },
    { path: '/admin/pawnshop', label: "Pete's Pawn Shop", db: 'omniverse', status: 'live' },
    { path: '/admin/auction', label: "Notheby's Auction", db: 'omniverse', status: 'live' },
  ]

  const DB_COLORS: Record<string, string> = { '1775gaming': '#CC0000', omniverse: '#8844CC', static: '#888' }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', maxWidth: '720px' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>SETTINGS</h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>Environment status and admin configuration reference</p>

      {/* Env var groups */}
      {envGroups.map(group => (
        <div key={group.title} style={section}>
          <div style={sTitle}>{group.title.toUpperCase()}</div>
          {group.vars.map(key => {
            const isSet = ok(key)
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #1F1F1F' }}>
                <span style={{ color: isSet ? '#00AA44' : '#CC0000', fontSize: '15px' }}>{isSet ? '✓' : '✗'}</span>
                <code style={{ color: isSet ? '#C0C0C0' : '#CC6666', fontSize: '12px', flex: 1 }}>{key}</code>
                <span style={{ color: isSet ? '#00AA44' : '#CC0000', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>{isSet ? 'SET' : 'MISSING'}</span>
              </div>
            )
          })}
        </div>
      ))}

      {/* Note about OMNIVERSE_SERVICE_ROLE_KEY */}
      {!ok('OMNIVERSE_SERVICE_ROLE_KEY') && (
        <div style={{ background: '#1A1200', border: '1px solid #B8860B40', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#B8860B', marginBottom: '6px' }}>ACTION REQUIRED</div>
          <p style={{ color: '#C0C0C0', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
            To enable game management pages (Players, Campaigns, Store, FAFO, Support, Pete's, Notheby's, World Lore), add <code style={{ color: '#B8860B' }}>OMNIVERSE_SERVICE_ROLE_KEY</code> to:<br />
            1. <strong>.env.local</strong> (local dev)<br />
            2. <strong>Vercel → Project → Settings → Environment Variables</strong> (production)<br /><br />
            Find the key at: <strong>Supabase → Omniverse Project → Settings → API → service_role (secret)</strong>
          </p>
        </div>
      )}

      {/* Route table */}
      <div style={section}>
        <div style={sTitle}>ADMIN ROUTES</div>
        {routes.map(({ path, label, db, status }) => (
          <div key={path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0', borderBottom: '1px solid #1A1A1A' }}>
            <code style={{ color: '#555', fontSize: '12px', width: '220px', flexShrink: 0 }}>{path}</code>
            <span style={{ color: '#C0C0C0', fontSize: '12px', flex: 1 }}>{label}</span>
            <span style={{ color: DB_COLORS[db] ?? '#888', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>{db}</span>
            <span style={{ color: '#00AA44', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif' }}>LIVE</span>
          </div>
        ))}
      </div>
    </div>
  )
}
