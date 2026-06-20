'use client'
import { useState } from 'react'

// ── Shared Sale type ───────────────────────────────────────────────────────────
export type Sale = {
  id: string; item_id: string; item_type: string; item_name: string
  discount_percent: number; starts_at: string; ends_at: string
  label: string | null; created_at: string
}

// ── Shared constants ───────────────────────────────────────────────────────────
export const inputStyle: React.CSSProperties = {
  background: '#111', border: '1px solid #333', color: 'white',
  padding: '7px 10px', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box',
}
export const btnBase: React.CSSProperties = {
  border: 'none', borderRadius: '4px', padding: '6px 12px',
  fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em',
}
export const TAB_NAMES = ['ANALYTICS', 'CATALOG', 'SALES'] as const
export type Tab = typeof TAB_NAMES[number]

export function isActive(s: Sale) {
  const now = Date.now()
  return new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() > now
}

// ── SaleForm ───────────────────────────────────────────────────────────────────
export function SaleForm({
  item, itemType, accentColor, onCreated,
}: {
  item: { id: string; name: string }
  itemType: string
  accentColor: string
  onCreated: (s: Sale) => void
}) {
  const [discount, setDiscount] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [label, setLabel] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const labelStyle: React.CSSProperties = {
    color: accentColor, fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
    display: 'block', marginBottom: '3px',
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true)
    const res = await fetch('/api/admin/items/sales', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: item.id, item_type: itemType, item_name: item.name,
        discount_percent: parseInt(discount), ends_at: new Date(endsAt).toISOString(),
        label: label || null,
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok || json.error) { setErr(json.error ?? 'Failed'); return }
    onCreated(json)
    setDiscount(''); setEndsAt(''); setLabel(''); setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ ...btnBase, background: '#0D1520', color: accentColor, border: `1px solid ${accentColor}20`, fontSize: '10px', padding: '4px 8px' }}
      >
        + SALE
      </button>
    )
  }

  return (
    <form onSubmit={submit} style={{ marginTop: '8px', padding: '10px', background: '#0D1520', borderRadius: '6px', border: `1px solid ${accentColor}20` }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ width: '60px' }}>
          <label style={labelStyle}>% OFF</label>
          <input type="number" min="1" max="99" required value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20" style={{ ...inputStyle, padding: '5px 7px' }} />
        </div>
        <div>
          <label style={labelStyle}>ENDS AT</label>
          <input type="datetime-local" required value={endsAt} onChange={e => setEndsAt(e.target.value)} style={{ ...inputStyle, padding: '5px 7px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={labelStyle}>LABEL</label>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Optional note" style={{ ...inputStyle, padding: '5px 7px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ ...btnBase, background: accentColor, color: '#000' }}>
          {loading ? '…' : 'SAVE'}
        </button>
        <button type="button" onClick={() => setOpen(false)} style={{ ...btnBase, background: 'transparent', color: '#555' }}>✕</button>
      </div>
      {err && <div style={{ color: '#CC4444', fontSize: '11px', marginTop: '6px' }}>{err}</div>}
    </form>
  )
}

// ── SalesTab ───────────────────────────────────────────────────────────────────
export function SalesTab({ sales: initial, accentColor }: { sales: Sale[]; accentColor: string }) {
  const [sales, setSales] = useState(initial)
  const [showHistory, setShowHistory] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  async function cancel(id: string) {
    setCancelling(id)
    await fetch('/api/admin/items/sales', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSales(prev => prev.map(s => s.id === id ? { ...s, ends_at: new Date().toISOString() } : s))
    setCancelling(null)
  }

  const active = sales.filter(isActive)
  const past = sales.filter(s => !isActive(s))

  return (
    <div>
      {active.length === 0 && past.length === 0 && (
        <div style={{ color: '#444', textAlign: 'center', padding: '40px', fontSize: '13px' }}>
          No sales yet. Use the "+ SALE" button on any item in the Catalog tab.
        </div>
      )}

      {active.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: accentColor, fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '10px' }}>
            ACTIVE SALES ({active.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {active.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '10px 14px' }}>
                <span style={{ color: accentColor, fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', minWidth: '48px' }}>{s.discount_percent}%</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{s.item_name}</div>
                  {s.label && <div style={{ color: '#555', fontSize: '11px' }}>{s.label}</div>}
                </div>
                <div style={{ color: '#444', fontSize: '11px', textAlign: 'right', flexShrink: 0 }}>
                  <div>{new Date(s.starts_at).toLocaleDateString()} →</div>
                  <div>{new Date(s.ends_at).toLocaleDateString()}</div>
                </div>
                <span style={{ background: '#0D1520', color: accentColor, border: `1px solid ${accentColor}30`, borderRadius: '3px', padding: '1px 6px', fontSize: '10px', flexShrink: 0 }}>LIVE</span>
                <button onClick={() => cancel(s.id)} disabled={cancelling === s.id} style={{ ...btnBase, background: '#2E0D0D', color: '#CC4444', padding: '4px 8px', flexShrink: 0 }}>
                  {cancelling === s.id ? '…' : 'END'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(h => !h)} style={{ ...btnBase, background: 'transparent', color: '#444', border: '1px solid #2A2A2A', marginBottom: '10px' }}>
            {showHistory ? '▾' : '▸'} HISTORY ({past.length})
          </button>
          {showHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {past.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#111', border: '1px solid #1A1A1A', borderRadius: '6px', padding: '8px 14px', opacity: 0.5 }}>
                  <span style={{ color: '#666', fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', minWidth: '48px' }}>{s.discount_percent}%</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#888', fontSize: '12px' }}>{s.item_name}</div>
                    {s.label && <div style={{ color: '#444', fontSize: '11px' }}>{s.label}</div>}
                  </div>
                  <div style={{ color: '#333', fontSize: '11px', textAlign: 'right' }}>
                    <div>{new Date(s.starts_at).toLocaleDateString()} →</div>
                    <div>{new Date(s.ends_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ color: '#333', fontSize: '10px' }}>ENDED</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
