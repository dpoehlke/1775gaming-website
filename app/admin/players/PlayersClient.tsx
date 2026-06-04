'use client'
import { useState } from 'react'

const TIER_NAMES = ['Citizen', 'Household Hero', 'Neighborhood Hero', 'Superhero', 'Archon']
const TIER_COLORS = ['#888', '#00D4FF', '#8844CC', '#B8860B', '#CC0000']

const inputStyle: React.CSSProperties = {
  background: '#1A1A1A', border: '1px solid #333', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px',
}

const LABEL: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
  display: 'block', marginBottom: '4px',
}

export default function PlayersClient({ initialData }: { initialData: any[] }) {
  const [players] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = players.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.display_name?.toLowerCase().includes(q) ||
      p.created_by?.toLowerCase().includes(q)
    const matchTier = filterTier === 'all' || String(p.subscription_tier) === filterTier
    return matchSearch && matchTier
  })

  const tierCounts = [0, 1, 2, 3, 4].map(n => players.filter(p => p.subscription_tier === n).length)

  return (
    <div>
      {/* Tier summary */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[0, 1, 2, 3, 4].map(n => (
          <div
            key={n}
            onClick={() => setFilterTier(filterTier === String(n) ? 'all' : String(n))}
            style={{
              background: '#1A1A1A', border: `1px solid #2A2A2A`,
              borderTop: `3px solid ${TIER_COLORS[n]}`, borderRadius: '6px',
              padding: '10px 16px', cursor: 'pointer',
              opacity: filterTier !== 'all' && filterTier !== String(n) ? 0.4 : 1,
            }}
          >
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '26px', color: TIER_COLORS[n], lineHeight: 1 }}>{tierCounts[n]}</div>
            <div style={{ color: '#666', fontSize: '10px', letterSpacing: '0.1em', marginTop: '4px' }}>{TIER_NAMES[n]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={LABEL}>SEARCH</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or email..." style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={LABEL}>TIER</label>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All Tiers</option>
            {[0, 1, 2, 3, 4].map(n => <option key={n} value={String(n)}>T{n} — {TIER_NAMES[n]}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#666' }}>
          {players.length === 0 ? 'No players registered yet.' : 'No players match your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(p => {
            const tier = p.subscription_tier ?? 0
            const color = TIER_COLORS[tier] ?? '#888'
            const isBanned = p.preferences?.banned === true
            const wl = p.whitelist_tier != null
            const isExpanded = expandedId === p.id

            return (
              <div key={p.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${isBanned ? '#CC4444' : color}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px' }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px' }}>
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{p.display_name ?? 'Unknown'}</span>
                      {isBanned && <span style={{ background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>BANNED</span>}
                      {wl && <span style={{ background: '#0D1A1A', color: '#00D4FF', border: '1px solid #00D4FF40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>WL T{p.whitelist_tier}</span>}
                    </div>
                    <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>{p.created_by}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: color, fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}>T{tier} {TIER_NAMES[tier]}</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>{p.caps_remaining ?? 0}/{p.caps_daily_limit ?? 5} CAPS</div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #2A2A2A', padding: '14px 20px', background: '#111', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {[
                      { label: 'CHARACTERS', value: p.max_characters === 999 ? '∞' : p.max_characters },
                      { label: 'SUBSCRIPTION SINCE', value: p.subscription_start ? new Date(p.subscription_start).toLocaleDateString() : '—' },
                      { label: 'WHITELIST EXPIRES', value: p.whitelist_expires ?? 'N/A' },
                      { label: 'JOINED', value: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '3px' }}>{label}</div>
                        <div style={{ color: '#C0C0C0', fontSize: '13px' }}>{String(value)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
