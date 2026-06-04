'use client'
import { useState } from 'react'

type Message = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export default function ContactClient({ initialData }: { initialData: Message[] }) {
  const [messages, setMessages] = useState(initialData)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterRead, setFilterRead] = useState('all')
  const [search, setSearch] = useState('')
  const [marking, setMarking] = useState<string | null>(null)

  const filtered = messages.filter(m => {
    const matchRead = filterRead === 'all' || (filterRead === 'unread' ? !m.read : m.read)
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase())
    return matchRead && matchSearch
  })

  async function toggleRead(msg: Message) {
    setMarking(msg.id)
    await fetch(`/api/admin/data/contact_messages/${msg.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !msg.read }),
    })
    setMessages(ms => ms.map(m => m.id === msg.id ? { ...m, read: !m.read } : m))
    setMarking(null)
  }

  async function markAllRead() {
    const unread = messages.filter(m => !m.read)
    await Promise.all(unread.map(m => fetch(`/api/admin/data/contact_messages/${m.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })))
    setMessages(ms => ms.map(m => ({ ...m, read: true })))
  }

  const unreadCount = messages.filter(m => !m.read).length
  const inputStyle: React.CSSProperties = { background: '#1A1A1A', border: '1px solid #2A2A2A', color: 'white', padding: '7px 10px', borderRadius: '4px', fontSize: '13px' }

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        {[{ label: 'UNREAD', value: unreadCount, color: '#CC0000' }, { label: 'TOTAL', value: messages.length, color: '#888' }].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: `1px solid #2A2A2A`, borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '10px 16px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '26px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color, fontSize: '10px', letterSpacing: '0.1em', marginTop: '3px' }}>{label}</div>
          </div>
        ))}
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ background: '#222', color: '#888', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, subject..." style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
        <select value={filterRead} onChange={e => setFilterRead(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#555' }}>
          No messages.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {filtered.map(msg => {
            const isExpanded = expandedId === msg.id
            return (
              <div key={msg.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${msg.read ? '#2A2A2A' : '#CC0000'}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer' }} onClick={() => { setExpandedId(isExpanded ? null : msg.id); if (!msg.read) toggleRead(msg) }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: msg.read ? '#333' : '#CC0000', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: msg.read ? '#C0C0C0' : 'white', fontWeight: msg.read ? 400 : 600, fontSize: '13px' }}>{msg.name}</span>
                      <span style={{ color: '#555', fontSize: '12px' }}>{msg.email}</span>
                    </div>
                    {msg.subject && <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>{msg.subject}</div>}
                  </div>
                  <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={e => { e.stopPropagation(); toggleRead(msg) }}
                    disabled={marking === msg.id}
                    style={{ background: '#111', color: msg.read ? '#444' : '#B8860B', border: '1px solid #2A2A2A', borderRadius: '3px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', flexShrink: 0 }}
                  >
                    {msg.read ? 'unread' : 'read'}
                  </button>
                  <span style={{ color: '#333', fontSize: '14px' }}>{isExpanded ? '▾' : '▸'}</span>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #2A2A2A', padding: '16px', background: '#111' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <div><div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em' }}>FROM</div><div style={{ color: 'white', fontSize: '13px' }}>{msg.name}</div></div>
                      <div><div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em' }}>EMAIL</div>
                        <a href={`mailto:${msg.email}`} style={{ color: '#B8860B', fontSize: '13px', textDecoration: 'none' }}>{msg.email}</a>
                      </div>
                      {msg.subject && <div><div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em' }}>SUBJECT</div><div style={{ color: 'white', fontSize: '13px' }}>{msg.subject}</div></div>}
                    </div>
                    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '14px', color: '#C0C0C0', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                      <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject ?? 'Your message')}`} style={{ background: '#CC0000', color: 'white', textDecoration: 'none', borderRadius: '4px', padding: '7px 14px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', letterSpacing: '0.08em' }}>
                        REPLY IN EMAIL
                      </a>
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
