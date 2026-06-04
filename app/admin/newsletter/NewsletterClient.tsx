'use client'

import { useState } from 'react'

interface Subscriber {
  id: string
  email: string
  source: string | null
  confirmed: boolean
  created_at: string
}

function exportCSV(rows: Subscriber[]) {
  const headers = ['Email', 'Source', 'Confirmed', 'Subscribed']
  const lines = rows.map(r => [
    r.email,
    r.source ?? '',
    r.confirmed ? 'Yes' : 'No',
    new Date(r.created_at).toLocaleDateString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const blob = new Blob([headers.join(',') + '\n' + lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const LABEL: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em',
  fontWeight: 700, display: 'block', marginBottom: '4px',
}

const inputStyle: React.CSSProperties = {
  background: '#1A1A1A', border: '1px solid #333', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px', width: '100%',
}

export default function NewsletterClient({ initialData }: { initialData: Subscriber[] }) {
  const [rows, setRows] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterConfirmed, setFilterConfirmed] = useState('all')
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  const sources = ['all', ...Array.from(new Set(rows.map(r => r.source ?? 'unknown').filter(Boolean)))]

  const filtered = rows.filter(r => {
    const matchSearch = !search || r.email.toLowerCase().includes(search.toLowerCase())
    const matchSource = filterSource === 'all' || (r.source ?? 'unknown') === filterSource
    const matchConfirmed = filterConfirmed === 'all' ||
      (filterConfirmed === 'yes' ? r.confirmed : !r.confirmed)
    return matchSearch && matchSource && matchConfirmed
  })

  async function removeSubscriber(id: string) {
    setRemoving(id)
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id))
        setConfirmRemove(null)
      }
    } finally {
      setRemoving(null)
    }
  }

  const confirmedCount = rows.filter(r => r.confirmed).length

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {[
          { label: 'TOTAL', value: rows.length, color: '#B8860B' },
          { label: 'CONFIRMED', value: confirmedCount, color: '#00AA44' },
          { label: 'UNCONFIRMED', value: rows.length - confirmedCount, color: '#888' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#1A1A1A', border: `1px solid ${color}40`,
            borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px 20px',
          }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color, fontSize: '10px', letterSpacing: '0.15em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={LABEL}>SEARCH</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={LABEL}>SOURCE</label>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            {sources.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sources' : s}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>CONFIRMED</label>
          <select value={filterConfirmed} onChange={e => setFilterConfirmed(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All</option>
            <option value="yes">Confirmed</option>
            <option value="no">Unconfirmed</option>
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

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px 80px',
        padding: '8px 16px', color: '#666', fontSize: '10px', letterSpacing: '0.12em',
        borderBottom: '1px solid #2A2A2A', marginBottom: '8px',
      }}>
        <span>EMAIL</span>
        <span>SOURCE</span>
        <span>CONFIRMED</span>
        <span>SUBSCRIBED</span>
        <span></span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #333', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#666' }}>
          No subscribers match your filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(r => (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 100px 120px 80px',
              alignItems: 'center', padding: '10px 16px',
              background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '4px',
            }}>
              <span style={{ color: 'white', fontSize: '13px' }}>{r.email}</span>
              <span style={{ color: '#888', fontSize: '12px' }}>{r.source ?? '—'}</span>
              <span>
                <span style={{
                  background: r.confirmed ? '#0D1F0D' : '#1A1A1A',
                  color: r.confirmed ? '#00AA44' : '#666',
                  border: `1px solid ${r.confirmed ? '#00AA44' : '#444'}`,
                  borderRadius: '3px', padding: '2px 8px', fontSize: '10px',
                  fontFamily: 'Bebas Neue, sans-serif',
                }}>
                  {r.confirmed ? 'YES' : 'NO'}
                </span>
              </span>
              <span style={{ color: '#666', fontSize: '11px' }}>
                {new Date(r.created_at).toLocaleDateString()}
              </span>
              <span style={{ textAlign: 'right' }}>
                {confirmRemove === r.id ? (
                  <span style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => removeSubscriber(r.id)}
                      disabled={removing === r.id}
                      style={{
                        background: '#CC0000', color: 'white', border: 'none',
                        padding: '3px 8px', fontSize: '10px', borderRadius: '3px',
                        cursor: 'pointer', fontFamily: 'Bebas Neue, sans-serif',
                      }}
                    >
                      {removing === r.id ? '...' : 'CONFIRM'}
                    </button>
                    <button
                      onClick={() => setConfirmRemove(null)}
                      style={{
                        background: '#333', color: '#888', border: 'none',
                        padding: '3px 8px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(r.id)}
                    title="Remove subscriber"
                    style={{
                      background: 'none', color: '#444', border: '1px solid #333',
                      padding: '3px 8px', fontSize: '11px', borderRadius: '3px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#CC4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                  >
                    ✕
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
