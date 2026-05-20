/**
 * /admin — SuperAdmin Command Center dashboard.
 * Server Component: session already verified by middleware.
 */
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/admin/login')

  // Live stats — errors return 0 rather than crashing
  const [betaRes, newsletterRes, routeRes] = await Promise.all([
    supabase.from('beta_signups').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('mission_routes').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'BETA PIONEERS',   value: betaRes.count       ?? 0, color: '#CC0000', href: '/admin/beta-signups' },
    { label: 'NEWSLETTER',      value: newsletterRes.count  ?? 0, color: '#B8860B', href: '/admin/newsletter'   },
    { label: 'MISSION ROUTES',  value: routeRes.count       ?? 0, color: '#00D4FF', href: '/admin/gpx'          },
  ]

  const actions = [
    { label: 'UPLOAD GPX MISSION', href: '/admin/gpx',          bg: '#CC0000' },
    { label: 'VIEW BETA SIGNUPS',  href: '/admin/beta-signups', bg: '#B8860B' },
    { label: 'VIEW SUBSCRIBERS',   href: '/admin/newsletter',   bg: '#B8860B' },
    { label: 'SIGN OUT',           href: '/admin/signout',      bg: '#333'    },
  ]

  return (
    <div style={{ background: '#0D0D0D', minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        background: '#1A1A1A', borderBottom: '2px solid #CC0000',
        padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#CC0000', letterSpacing: '0.1em' }}>
            1775 GAMING
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', color: '#B8860B', letterSpacing: '0.2em', marginLeft: '12px' }}>
            COMMAND CENTER
          </span>
        </div>
        <div style={{ color: '#C0C0C0', fontSize: '13px' }}>
          SuperAdmin: {session.user.email}
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', color: 'white', margin: '0 0 8px' }}>
          MISSION BRIEFING
        </h1>
        <p style={{ color: '#C0C0C0', margin: '0 0 40px' }}>Live stats for 1775 Gaming LLC</p>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {stats.map((stat) => (
            <a
              key={stat.label}
              href={stat.href}
              style={{
                background: '#1A1A1A',
                border: '1px solid #333',
                borderTop: `3px solid ${stat.color}`,
                borderRadius: '8px',
                padding: '32px',
                textDecoration: 'none',
                display: 'block',
              }}
            >
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '64px', color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ color: '#C0C0C0', fontSize: '12px', letterSpacing: '0.15em', marginTop: '8px' }}>
                {stat.label}
              </div>
            </a>
          ))}
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: '#B8860B', margin: '0 0 20px' }}>
          QUICK ACTIONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '600px' }}>
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              style={{
                background: action.bg,
                color: 'white',
                padding: '16px 24px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '16px',
                letterSpacing: '0.1em',
                textAlign: 'center',
                display: 'block',
              }}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
