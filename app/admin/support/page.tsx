'use client'
/**
 * /admin/support — Support ticket management.
 */
import { useState, useEffect } from 'react'

type Ticket = {
  id: string
  subject: string
  category: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  player_display_name: string
  player_email: string
  messages: { role: string; content: string; created_at: string }[]
  created_date: string
  resolved_at?: string
}

const STATUS_COLORS: Record<string, string> = { open: '#B8860B', in_progress: '#00D4FF', resolved: '#00AA44', closed: '#555' }
const PRIORITY_COLORS: Record<string, string> = { low: '#444', normal: '#00D4FF', high: '#B8860B', critical: '#CC0000' }

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
    fetch('/api/admin/data/support_tickets?order=created_date.desc&limit=200')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setTickets(d); setLoading(false) })
      .catch(() => { setError('support_tickets table not found'); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/data/support_tickets/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) }),
    })
    setTickets(ts => ts.map(t => t.id === id ? { ...t, status: status as Ticket['status'] } : t))
  }

  async function sendReply(ticket: Ticket) {
    const msg = reply[ticket.id]?.trim()
    if (!msg) return
    setSending(ticket.id)
    const updated = [
      ...(ticket.messages ?? []),
      { role: 'admin', content: msg, created_at: new Date().toISOString() },
    ]
    await fetch(`/api/admin/data/support_tickets/${ticket.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated, status: 'in_progress' }),
    })
    setTickets(ts => ts.map(t => t.id === ticket.id ? { ...t, messages: updated, status: 'in_progress' } : t))
    setReply(r => ({ ...r, [ticket.id]: '' }))
    setSending(null)
  }

  const filtered = tickets.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchSearch = !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.player_display_name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = { open: tickets.filter(t => t.status === 'open').length, in_progress: tickets.filter(t => t.status === 'in_progress').length, critical: tickets.filter(t => t.priority === 'critical' && !['closed','resolved'].includes(t.status)).length }

  const inputStyle: React.CSSProperties = { background: '#0D0D0D', border: '1px solid #333', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '13px' }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>SUPPORT TICKETS</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>{error || `${tickets.length} total tickets`}</p>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'OPEN', value: counts.open, color: '#B8860B' },
          { label: 'IN PROGRESS', value: counts.in_progress, color: '#00D4FF' },
          { label: 'CRITICAL', value: counts.critical, color: '#CC0000' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: `1px solid #2A2A2A`, borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px 20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color, fontSize: '10px', letterSpacing: '0.12em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: '#444', padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#444', marginBottom: '8px' }}>TABLE NOT YET CREATED</div>
          <div style={{ color: '#666', fontSize: '13px' }}>Create the <code style={{ color: '#B8860B' }}>support_tickets</code> table in Supabase.</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
          <div style={{ color: '#666', fontSize: '13px' }}>No tickets found.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(ticket => {
            const isExpanded = expandedId === ticket.id
            const hasNewReply = ticket.messages?.slice(-1)[0]?.role === 'player' && ticket.status !== 'closed'
            return (
              <div key={ticket.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${PRIORITY_COLORS[ticket.priority] ?? '#444'}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : ticket.id)}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PRIORITY_COLORS[ticket.priority] ?? '#444', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{ticket.subject}</span>
                      {hasNewReply && <span style={{ background: '#00D4FF20', color: '#00D4FF', border: '1px solid #00D4FF40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>NEW REPLY</span>}
                    </div>
                    <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>
                      {ticket.player_display_name} · {ticket.category} · {ticket.messages?.length ?? 0} messages
                    </div>
                  </div>
                  <span style={{ color: STATUS_COLORS[ticket.status] ?? '#555', fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>{ticket.status.replace('_', ' ').toUpperCase()}</span>
                  <span style={{ color: '#555', fontSize: '11px', flexShrink: 0 }}>{new Date(ticket.created_date).toLocaleDateString()}</span>
                  <span style={{ color: '#444', fontSize: '14px' }}>{isExpanded ? '▾' : '▸'}</span>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #2A2A2A', padding: '16px 20px', background: '#111' }}>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '14px' }}>{ticket.player_email}</div>
                    {/* Message thread */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                      {(ticket.messages ?? []).map((msg, i) => (
                        <div key={i} style={{ background: msg.role === 'admin' ? '#CC000015' : '#1A1A1A', border: `1px solid ${msg.role === 'admin' ? '#CC000030' : '#2A2A2A'}`, borderRadius: '6px', padding: '10px 14px' }}>
                          <div style={{ color: msg.role === 'admin' ? '#CC0000' : '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>{msg.role === 'admin' ? 'ADMIN' : 'PLAYER'} · {new Date(msg.created_at).toLocaleString()}</div>
                          <div style={{ color: '#C0C0C0', fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</div>
                        </div>
                      ))}
                    </div>
                    {/* Reply box */}
                    {!['closed', 'resolved'].includes(ticket.status) && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <textarea
                          value={reply[ticket.id] ?? ''}
                          onChange={e => setReply(r => ({ ...r, [ticket.id]: e.target.value }))}
                          rows={2} placeholder="Type your reply..."
                          style={{ flex: 1, background: '#0D0D0D', border: '1px solid #333', color: 'white', borderRadius: '4px', padding: '8px 12px', fontSize: '13px', resize: 'vertical' }}
                        />
                        <button onClick={() => sendReply(ticket)} disabled={sending === ticket.id} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', alignSelf: 'flex-end' }}>
                          {sending === ticket.id ? '...' : 'SEND'}
                        </button>
                      </div>
                    )}
                    {/* Status actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(['open', 'in_progress', 'resolved', 'closed'] as const).filter(s => s !== ticket.status).map(s => (
                        <button key={s} onClick={() => updateStatus(ticket.id, s)} style={{ background: '#222', color: STATUS_COLORS[s] ?? '#888', border: `1px solid ${STATUS_COLORS[s] ?? '#444'}30`, borderRadius: '4px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer' }}>
                          Mark {s.replace('_', ' ')}
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
