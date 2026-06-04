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
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = players.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.display_name?.toLowerCase().includes(q) || p.user_id?.toLowerCase().includes(q)
    const matchTier = filterTier === 'all' || String(p.subscription_tier) === filterTier
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'banned' ? p.is_banned :
      filterStatus === 'suspended' ? (p.is_suspended && !p.is_banned) :
      filterStatus === 'whitelisted' ? p.whitelist_tier != null :
      true
    return matchSearch && matchTier && matchStatus
  })

  const tierCounts = [0, 1, 2, 3, 4].map(n => players.filter(p => p.subscription_tier === n).length)
  const bannedCount = players.filter(p => p.is_banned).length
  const suspendedCount = players.filter(p => p.is_suspended && !p.is_banned).length

  return (
    <div>
      {/* Tier summary chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {[0, 1, 2, 3, 4].map(n => (
          <div key={n} onClick={() => setFilterTier(filterTier === String(n) ? 'all' : String(n))} style={{
            background: '#1A1A1A', border: `1px solid #2A2A2A`, borderTop: `3px solid ${TIER_COLORS[n]}`,
            borderRadius: '6px', padding: '10px 14px', cursor: 'pointer', minWidth: '80px',
            opacity: filterTier !== 'all' && filterTier !== String(n) ? 0.35 : 1,
          }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: TIER_COLORS[n], lineHeight: 1 }}>{tierCounts[n]}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '3px' }}>T{n} {TIER_NAMES[n]}</div>
          </div>
        ))}
        {bannedCount > 0 && (
          <div onClick={() => setFilterStatus(filterStatus === 'banned' ? 'all' : 'banned')} style={{
            background: '#1F0D0D', border: '1px solid #CC000040', borderTop: '3px solid #CC0000',
            borderRadius: '6px', padding: '10px 14px', cursor: 'pointer',
            opacity: filterStatus !== 'all' && filterStatus !== 'banned' ? 0.35 : 1,
          }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#CC0000', lineHeight: 1 }}>{bannedCount}</div>
            <div style={{ color: '#CC444480', fontSize: '9px', letterSpacing: '0.1em', marginTop: '3px' }}>BANNED</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={LABEL}>SEARCH</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Display name or user ID..." style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={LABEL}>TIER</label>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All Tiers</option>
            {[0,1,2,3,4].map(n => <option key={n} value={String(n)}>T{n} — {TIER_NAMES[n]}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>STATUS</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
            <option value="whitelisted">Whitelisted</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#555' }}>
          {players.length === 0 ? 'No players registered yet.' : 'No players match your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(p => {
            const tier = p.subscription_tier ?? 0
            const color = TIER_COLORS[Math.min(tier, 4)] ?? '#888'
            const isExpanded = expandedId === p.id
            const isSuspended = p.is_suspended && new Date(p.suspension_expires_at) > new Date()

            return (
              <div key={p.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${p.is_banned ? '#CC0000' : isSuspended ? '#B8860B' : color}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px' }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '13px' }}>
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{p.display_name ?? 'No display name'}</span>
                      {p.is_banned && <span style={{ background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>BANNED</span>}
                      {isSuspended && !p.is_banned && <span style={{ background: '#1A1200', color: '#B8860B', border: '1px solid #B8860B40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>SUSPENDED</span>}
                      {p.whitelist_tier != null && <span style={{ background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>WL T{p.whitelist_tier}</span>}
                    </div>
                    <div style={{ color: '#444', fontSize: '10px', marginTop: '1px', fontFamily: 'monospace' }}>{p.user_id?.slice(0, 8)}…</div>
                  </div>

                  {/* Currency stats */}
                  <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#00D4FF', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px' }}>{p.caps_remaining ?? 0}/{p.caps_daily_limit ?? 5}</div>
                      <div style={{ color: '#333', fontSize: '9px' }}>CAPS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#B8860B', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px' }}>{(p.omni_credits ?? 0).toLocaleString()}</div>
                      <div style={{ color: '#333', fontSize: '9px' }}>OC</div>
                    </div>
                  </div>

                  {/* Tier */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: color, fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>T{tier}</div>
                    <div style={{ color: '#444', fontSize: '10px' }}>{TIER_NAMES[Math.min(tier, 4)]}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #222', padding: '14px 18px', background: '#111', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                    {[
                      { label: 'VICTORY POINTS', value: (p.victory_points ?? 0).toLocaleString() },
                      { label: 'MAX CHARACTERS', value: p.max_characters === 999 ? '∞' : p.max_characters },
                      { label: 'WHITELIST TIER', value: p.whitelist_tier != null ? `T${p.whitelist_tier}` : 'None' },
                      { label: 'WHITELIST EXPIRES', value: p.whitelist_expires ?? 'Never' },
                      { label: 'JOINED', value: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—' },
                      { label: 'LAST ACTIVE', value: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—' },
                      ...(p.is_banned ? [{ label: 'BAN REASON', value: p.ban_reason ?? 'No reason given' }] : []),
                      ...(isSuspended ? [{ label: 'SUSPENSION ENDS', value: new Date(p.suspension_expires_at).toLocaleDateString() }] : []),
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
