'use client'
/**
 * Admin shell layout — sidebar nav + top bar.
 * Skips sidebar on /admin/login (public page).
 */
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const NAV = [
  { section: 'WEBSITE', items: [
    { href: '/admin',             label: 'Dashboard',         icon: '⬛' },
    { href: '/admin/beta-signups',label: 'Beta Pioneers',     icon: '🧪' },
    { href: '/admin/newsletter',  label: 'Newsletter',        icon: '📧' },
    { href: '/admin/contact',     label: 'Contact Inbox',     icon: '✉️' },
    { href: '/admin/gpx',         label: 'GPX Missions',      icon: '🗺️' },
  ]},
  { section: 'GAME', items: [
    { href: '/admin/players',      label: 'Players',          icon: '👤' },
    { href: '/admin/campaigns',    label: 'Campaigns',        icon: '🗡️' },
    { href: '/admin/store',        label: 'Store Items',      icon: '🛒' },
    { href: '/admin/subscriptions',label: 'Subscriptions',    icon: '👑' },
    { href: '/admin/world-lore',   label: 'World Lore',       icon: '🌐' },
  ]},
  { section: 'OPERATIONS', items: [
    { href: '/admin/analytics',   label: 'Analytics',         icon: '📊' },
    { href: '/admin/support',     label: 'Support Tickets',   icon: '🎫' },
    { href: '/admin/fafo',        label: 'FAFO Encounters',   icon: '⚡' },
    { href: '/admin/pawnshop',    label: "Pete's Pawn Shop",  icon: '🛍️' },
    { href: '/admin/auction',     label: "Notheby's Auction", icon: '🔨' },
  ]},
  { section: 'SYSTEM', items: [
    { href: '/admin/settings',    label: 'Settings',          icon: '⚙️' },
  ]},
]

function Sidebar({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#CC0000', letterSpacing: '0.08em' }}>
          1775 GAMING
        </div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '11px', color: '#B8860B', letterSpacing: '0.25em', marginTop: '2px' }}>
          COMMAND CENTER
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: '8px' }}>
            <div style={{ color: '#444', fontSize: '9px', letterSpacing: '0.2em', fontWeight: 700, padding: '8px 12px 4px', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {section}
            </div>
            {items.map(({ href, label, icon }) => {
              const exact = href === '/admin'
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '6px', margin: '1px 0',
                    textDecoration: 'none', fontSize: '13px',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    background: active ? '#CC000015' : 'transparent',
                    color: active ? '#CC0000' : '#888',
                    borderLeft: active ? '2px solid #CC0000' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #2A2A2A' }}>
        <a href="/admin/signout" style={{ color: '#555', fontSize: '12px', fontFamily: 'IBM Plex Sans, sans-serif', textDecoration: 'none' }}>
          Sign out →
        </a>
      </div>
    </div>
  )
}

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Login page — no chrome
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div style={{ display: 'flex', background: '#0D0D0D', minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: '#111', borderRight: '1px solid #1F1F1F',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <Sidebar pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
        />
      )}

      {/* Mobile drawer */}
      <aside style={{
        position: 'fixed', top: 0, left: mobileOpen ? 0 : '-240px', bottom: 0,
        width: '240px', background: '#111', borderRight: '1px solid #1F1F1F',
        zIndex: 50, transition: 'left 0.25s ease', display: 'flex', flexDirection: 'column',
      }}>
        <Sidebar pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#111', borderBottom: '1px solid #1F1F1F',
          padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px', display: 'block', padding: '4px' }}
          >
            ☰
          </button>

          {/* Breadcrumb / page title */}
          <div style={{ flex: 1 }}>
            {(() => {
              const flat = NAV.flatMap(g => g.items)
              const exact = flat.find(i => i.href === pathname)
              const partial = flat.filter(i => i.href !== '/admin' && pathname.startsWith(i.href)).sort((a,b) => b.href.length - a.href.length)[0]
              const found = exact || partial
              return found ? (
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#C0C0C0', letterSpacing: '0.1em' }}>
                  {found.icon} {found.label.toUpperCase()}
                </span>
              ) : null
            })()}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
