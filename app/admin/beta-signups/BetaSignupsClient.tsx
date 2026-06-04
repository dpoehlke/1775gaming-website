'use client'

import { useState } from 'react'

type BetaStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted'

interface BetaSignup {
  id: string
  first_name: string
  last_name: string
  email: string
  age_range: string | null
  platform: string | null
  hours_per_week: string | null
  genres: string[] | null
  prior_beta: boolean
  device_model: string | null
  why_beta: string | null
  heard_from: string | null
  nda_agreed: boolean
  status: BetaStatus
  created_at: string
}

const STATUS_COLORS: Record<BetaStatus, { bg: string; text: string; border: string }> = {
  pending:    { bg: '#1A1200', text: '#B8860B', border: '#B8860B' },
  approved:   { bg: '#0D1F0D', text: '#00AA44', border: '#00AA44' },
  rejected:   { bg: '#1F0D0D', text: '#CC4444', border: '#CC4444' },
  waitlisted: { bg: '#0D0D1F', text: '#4488CC', border: '#4488CC' },
}

const NEXT_STATUSES: Record<BetaStatus, BetaStatus[]> = {
  pending:    ['approved', 'rejected', 'waitlisted'],
  approved:   ['rejected', 'waitlisted', 'pending'],
  rejected:   ['approved', 'waitlisted', 'pending'],
  waitlisted: ['approved', 'rejected', 'pending'],
}

function exportCSV(rows: BetaSignup[]) {
  const headers = [
    'First Name', 'Last Name', 'Email', 'Status', 'Platform',
    'Age Range', 'Hours/Week', 'Genres', 'Prior Beta', 'Device',
    'Heard From', 'NDA Agreed', 'Submitted',
  ]
  const lines = rows.map(r => [
    r.first_name, r.last_name, r.email, r.status,
    r.platform ?? '', r.age_range ?? '', r.hours_per_week ?? '',
    (r.genres ?? []).join(';'), r.prior_beta ? 'Yes' : 'No',
    r.device_model ?? '', r.heard_from ?? '',
    r.nda_agreed ? 'Yes' : 'No',
    new Date(r.created_at).toLocaleDateString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const blob = new Blob([headers.join(',') + '\n' + lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `beta-signups-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const LABEL: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em',
  fontWeight: 700, display: 'block', marginBottom: '4px',
}

export default function BetaSignupsClient({ initialData }: { initialData: BetaSignup[] }) {
  const [rows, setRows] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchPlatform = filterPlatform === 'all' || r.platform === filterPlatform
    return matchSearch && matchStatus && matchPlatform
  })

  const counts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  async function updateStatus(id: string, newStatus: BetaStatus) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/beta-signups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setRows(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      }
    } finally {
      setUpdating(null)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#1A1A1A', border: '1px solid #333', color: 'white',
    padding: '8px 12px', borderRadius: '4px', fontSize: '13px', width: '100%',
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {(['pending', 'approved', 'waitlisted', 'rejected'] as BetaStatus[]).map(s => {
          const c = STATUS_COLORS[s]
          return (
            <div key={s} style={{
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: '6px', padding: '10px 20px', cursor: 'pointer',
              opacity: filterStatus !== 'all' && filterStatus !== s ? 0.4 : 1,
            }} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: c.text, lineHeight: 1 }}>
                {counts[s] ?? 0}
              </div>
              <div style={{ color: c.text, fontSize: '10px', letterSpacing: '0.15em', marginTop: '4px', textTransform: 'uppercase' }}>
                {s}
              </div>
            </div>
          )
        })}
        <div style={{
          background: '#1A1A1A', border: '1px solid #444', borderRadius: '6px',
          padding: '10px 20px', marginLeft: 'auto', display: 'flex', alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: '#C0C0C0', lineHeight: 1 }}>
            {rows.length}
          </div>
          <div style={{ color: '#C0C0C0', fontSize: '10px', letterSpacing: '0.15em', marginTop: '4px', marginLeft: '8px', textTransform: 'uppercase' }}>
            total
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={LABEL}>SEARCH</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name or email..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={LABEL}>PLATFORM</label>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All Platforms</option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <div>
          <label style={LABEL}>STATUS</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          style={{
            background: '#333', color: '#C0C0C0', border: '1px solid #555',
            padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
            fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'Bebas Neue, sans-serif',
          }}
        >
          EXPORT CSV ({filtered.length})
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #333', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#666' }}>
          No signups match your filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(r => {
            const sc = STATUS_COLORS[r.status]
            const isExpanded = expandedId === r.id
            return (
              <div key={r.id} style={{
                background: '#1A1A1A', border: '1px solid #333',
                borderLeft: `3px solid ${sc.border}`, borderRadius: '6px',
                overflow: 'hidden',
              }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                      {r.first_name} {r.last_name}
                    </div>
                    <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{r.email}</div>
                  </div>

                  <div style={{ color: '#C0C0C0', fontSize: '12px', flexShrink: 0 }}>
                    {r.platform ?? '—'}
                  </div>

                  <div style={{
                    background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                    borderRadius: '3px', padding: '2px 8px', fontSize: '11px',
                    fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.1em', flexShrink: 0,
                  }}>
                    {r.status.toUpperCase()}
                  </div>

                  <div style={{ color: '#555', fontSize: '11px', flexShrink: 0 }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>

                  {/* Status change buttons */}
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {NEXT_STATUSES[r.status].map(ns => {
                      const nc = STATUS_COLORS[ns]
                      return (
                        <button
                          key={ns}
                          disabled={updating === r.id}
                          onClick={() => updateStatus(r.id, ns)}
                          title={`Mark as ${ns}`}
                          style={{
                            background: nc.bg, color: nc.text, border: `1px solid ${nc.border}`,
                            borderRadius: '3px', padding: '3px 8px', fontSize: '10px',
                            fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.08em',
                            cursor: updating === r.id ? 'not-allowed' : 'pointer',
                            opacity: updating === r.id ? 0.5 : 1,
                          }}
                        >
                          {ns.slice(0, 4).toUpperCase()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #2A2A2A', padding: '16px 20px', background: '#111', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { label: 'AGE RANGE',    value: r.age_range    ?? '—' },
                      { label: 'HOURS/WEEK',   value: r.hours_per_week ?? '—' },
                      { label: 'DEVICE',       value: r.device_model ?? '—' },
                      { label: 'HEARD FROM',   value: r.heard_from   ?? '—' },
                      { label: 'PRIOR BETA',   value: r.prior_beta ? 'Yes' : 'No' },
                      { label: 'NDA',          value: r.nda_agreed ? 'Agreed' : 'Not agreed' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '4px' }}>{label}</div>
                        <div style={{ color: '#C0C0C0', fontSize: '13px' }}>{value}</div>
                      </div>
                    ))}

                    {r.genres && r.genres.length > 0 && (
                      <div>
                        <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '4px' }}>GENRES</div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {r.genres.map(g => (
                            <span key={g} style={{ background: '#222', border: '1px solid #444', color: '#C0C0C0', borderRadius: '3px', padding: '1px 6px', fontSize: '11px' }}>{g}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.why_beta && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', marginBottom: '4px' }}>WHY BETA TEST</div>
                        <div style={{ color: '#C0C0C0', fontSize: '13px', lineHeight: 1.6 }}>{r.why_beta}</div>
                      </div>
                    )}
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
