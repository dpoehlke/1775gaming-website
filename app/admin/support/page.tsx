'use client'
/**
 * /admin/support — Support ticket management.
 * Routes to Omniverse project.
 *
 * support_tickets columns:
 *   id, player_id, subject, category, description, status, messages (jsonb),
 *   assigned_admin, created_at, updated_at
 */
import { useState, useEffect } from 'react'

type Ticket = {
  id: string
  player_id: string
  subject: string
  category: string
  priority?: 'low' | 'normal' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  description: string
  messages: { role: string; content: string; created_at: string }[] | null
  assigned_admin: string | null
  created_at: string
  updated_at: string
}

const STATUS_COLORS: Record<string, string> = {
  open: '#B8860B', in_progress: '#00D4FF', resolved: '#00AA44', closed: '#444',
}

const API = (path: string, query?: string) => {
  const qs = query ? `&${query}` : ''
  return `/api/admin/data/${path}?project=omniverse${qs}`
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('open')
  const [search, setSearch] = useState('')
  const [reply, setReply] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    fetch(API('support_tickets', 'order=updated_at.desc&limit=200'))
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => { setTickets(d); setLoading(false) })
      .catch(() => { setError('support_tickets error — check Omniverse service role key'); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(API(`support_tickets/${id}`), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    })
    setTickets(ts => ts.map(t => t.id === id ? { ...t, status: status as Ticket['status'], updated_at: new Date().toISOString() } : t))
  }

  async function sendReply(ticket: Ticket) {
    const msg = reply[ticket.id]?.trim()
    if (!msg) return
    setSending(ticket.id)
    const existing = ticket.messages ?? []
    const updated = [...existing, { role: 'admin', content: msg, created_at: new Date().toISOString() }]
    await fetch(API(`support_tickets/${ticket.id}`), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated, status: 'in_progress', updated_at: new Date().toISOString() }),
    })
    setTickets(ts => ts.map(t => t.id === ticket.id ? { ...t, messages: updated, status: 'in_progress' } : t))
    setReply(r => ({ ...r, [ticket.id]: '' }))
    setSending(null)
  }

  const filtered = tickets.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchSearch = !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.player_id?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgCount = tickets.filter(t => t.status === 'in_progress').length
  const inputStyle: React.CSSProperties = { background: '#111', border: '1px solid #2A2A2A', color: 'white', padding: '7px 10px', borderRadius: '4px', fontSize: '13px' }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>SUPPORT TICKETS</h1>
      <p style={{ color: '#666', margin: '0 0 20px', fontSize: '13px' }}>{error || `${tickets.length} total tickets`}</p>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[{ label: 'OPEN', value: openCount, color: '#B8860B' }, { label: 'IN PROGRESS', value: inProgCount, color: '#00D4FF' }].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', borderTop: `3px solid ${color}`, border: '1px solid #2A2A2A', borderRadius: '6px', padding: '12px 18px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '26px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color, fontSize: '10px', letterSpacing: '0.1em', marginTop: '3px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subject or player ID..." style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: '#444', padding: '40px', textAlign: 'center' }}>Loading Omniverse tickets…</div>
      ) : error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', borderRadius: '8px', padding: '20px', color: '#CC4444' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <div style={{ color: '#555', fontSize: '13px' }}>No tickets found.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {filtered.map(ticket => {
            const isExpanded = expandedId === ticket.id
            const msgs = ticket.messages ?? []
            const lastMsg = msgs[msgs.length - 1]
            const hasNewReply = lastMsg?.role === 'player' && !['closed', 'resolved'].includes(ticket.status)
            const allMsgs = ticket.description
              ? [{ role: 'player', content: ticket.description, created_at: ticket.created_at }, ...msgs]
              : msgs

            return (
              <div key={ticket.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${STATUS_COLORS[ticket.status] ?? '#444'}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : ticket.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{ticket.subject}</span>
                      {hasNewReply && <span style={{ background: '#00D4FF20', color: '#00D4FF', border: '1px solid #00D4FF30', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>NEW REPLY</span>}
                    </div>
                    <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>
                      {ticket.category} · {allMsgs.length} message{allMsgs.length !== 1 ? 's' : ''} · updated {new Date(ticket.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ color: STATUS_COLORS[ticket.status] ?? '#555', fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>{ticket.status.replace('_', ' ').toUpperCase()}</span>
                  <span style={{ color: '#333', fontSize: '14px' }}>{isExpanded ? '▾' : '▸'}</span>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #2A2A2A', padding: '14px 16px', background: '#111' }}>
                    <div style={{ color: '#444', fontSize: '11px', marginBottom: '12px', fontFamily: 'monospace' }}>Player ID: {ticket.player_id}</div>

                    {/* Message thread */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', maxHeight: '280px', overflowY: 'auto' }}>
                      {allMsgs.map((msg, i) => (
                        <div key={i} style={{ background: msg.role === 'admin' ? '#CC000015' : '#1A1A1A', border: `1px solid ${msg.role === 'admin' ? '#CC000030' : '#2A2A2A'}`, borderRadius: '6px', padding: '10px 12px' }}>
                          <div style={{ color: msg.role === 'admin' ? '#CC0000' : '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>
                            {msg.role === 'admin' ? '👤 ADMIN' : '🎮 PLAYER'} · {new Date(msg.created_at).toLocaleString()}
                          </div>
                          <div style={{ color: '#C0C0C0', fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</div>
                        </div>
                      ))}
                    </div>

                    {!['closed', 'resolved'].includes(ticket.status) && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <textarea
                          value={reply[ticket.id] ?? ''}
                          onChange={e => setReply(r => ({ ...r, [ticket.id]: e.target.value }))}
                          rows={2} placeholder="Type your reply…"
                          style={{ flex: 1, background: '#0D0D0D', border: '1px solid #333', color: 'white', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', resize: 'vertical' }}
                        />
                        <button onClick={() => sendReply(ticket)} disabled={sending === ticket.id || !reply[ticket.id]?.trim()} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', alignSelf: 'flex-end', opacity: !reply[ticket.id]?.trim() ? 0.5 : 1 }}>
                          {sending === ticket.id ? '…' : 'SEND'}
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['open', 'in_progress', 'resolved', 'closed'] as const).filter(s => s !== ticket.status).map(s => (
                        <button key={s} onClick={() => updateStatus(ticket.id, s)} style={{ background: '#1A1A1A', color: STATUS_COLORS[s] ?? '#888', border: `1px solid ${STATUS_COLORS[s] ?? '#444'}30`, borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                          → {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
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
