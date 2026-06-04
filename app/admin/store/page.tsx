'use client'
/**
 * /admin/store — Omniverse store item management (CRUD).
 * Routes to Omniverse project. 16 items already live.
 *
 * Actual store_items columns:
 *   id, name, description, category, price_type, price, quantity,
 *   min_tier, icon_url, active, sort_order, revenuecat_product_id, created_at
 */
import { useState, useEffect } from 'react'

type StoreItem = {
  id: string
  name: string
  description: string
  category: string
  price_type: 'real_money' | 'in_game_currency'
  price: number
  quantity: number | null
  min_tier: number
  icon_url: string | null
  active: boolean
  sort_order: number
  revenuecat_product_id: string | null
  created_at: string
}

const CATEGORIES = [
  { value: 'subscription', label: '👑 Subscription' },
  { value: 'caps', label: '⚡ CAPS' },
  { value: 'victory_points', label: '⭐ Victory Points' },
  { value: 'character_points', label: '✨ Character Points' },
  { value: 'currency', label: '🪙 Omni-Credits' },
  { value: 'sidekick', label: '👥 Sidekick' },
  { value: 'team_up', label: '⚔️ Team Up' },
  { value: 'contact', label: '👁️ Contact' },
  { value: 'portrait', label: '🖼️ Portrait' },
]

const inputStyle: React.CSSProperties = {
  background: '#0D0D0D', border: '1px solid #333', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', fontWeight: 700, display: 'block', marginBottom: '4px',
}

const EMPTY: Partial<StoreItem> = {
  name: '', description: '', category: 'caps', price_type: 'in_game_currency',
  price: 0, quantity: null, min_tier: 0, icon_url: '', active: true, sort_order: 0, revenuecat_product_id: '',
}

const API = (path: string) => `/api/admin/data/${path}?project=omniverse`

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Partial<StoreItem> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [filterType, setFilterType] = useState('all')

  async function load() {
    setLoading(true)
    const res = await fetch(API('store_items?order=sort_order.asc'))
    if (res.ok) setItems(await res.json()); else setError('store_items error')
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    const { id, created_at, ...payload } = editing as any
    const url = isNew ? API('store_items') : API(`store_items/${id}`)
    const method = isNew ? 'POST' : 'PATCH'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setEditing(null); await load(); setSaving(false)
  }

  async function toggle(item: StoreItem) {
    await fetch(API(`store_items/${item.id}`), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    })
    await load()
  }

  async function del(id: string) {
    if (!confirm('Delete this store item?')) return
    await fetch(API(`store_items/${id}`), { method: 'DELETE' })
    await load()
  }

  const upd = (k: string, v: unknown) => setEditing(prev => ({ ...prev, [k]: v }))

  const filtered = items.filter(i => {
    const matchCat = filterCat === 'all' || i.category === filterCat
    const matchType = filterType === 'all' || i.price_type === filterType
    return matchCat && matchType
  })

  const ocCount = items.filter(i => i.price_type === 'in_game_currency' && i.active).length
  const realCount = items.filter(i => i.price_type === 'real_money' && i.active).length

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>STORE ITEMS</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{error || `${items.length} items — ${ocCount} OC active, ${realCount} real money active`}</p>
        </div>
        <button onClick={() => { setIsNew(true); setEditing({ ...EMPTY }) }} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 20px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', letterSpacing: '0.1em', cursor: 'pointer' }}>
          + NEW ITEM
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {[{ value: 'all', label: 'All' }, ...CATEGORIES].map(c => (
          <button key={c.value} onClick={() => setFilterCat(c.value)} style={{
            background: filterCat === c.value ? '#CC000020' : 'transparent',
            color: filterCat === c.value ? '#CC0000' : '#666',
            border: `1px solid ${filterCat === c.value ? '#CC000040' : '#2A2A2A'}`,
            borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer',
          }}>{c.label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[{ value: 'all', label: 'All Price Types' }, { value: 'in_game_currency', label: '🪙 OC (Pete\'s)' }, { value: 'real_money', label: '💳 Real Money (Notheby\'s)' }].map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)} style={{
            background: filterType === t.value ? '#B8860B20' : 'transparent',
            color: filterType === t.value ? '#B8860B' : '#666',
            border: `1px solid ${filterType === t.value ? '#B8860B40' : '#2A2A2A'}`,
            borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#444', padding: '40px', textAlign: 'center' }}>Loading Omniverse store…</div>
      ) : error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', borderRadius: '8px', padding: '20px', color: '#CC4444' }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#555' }}>No items.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${item.active ? (item.price_type === 'real_money' ? '#B8860B' : '#00D4FF') : '#333'}`, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
              {item.icon_url ? (
                <img src={item.icon_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', background: '#222', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {CATEGORIES.find(c => c.value === item.category)?.label.split(' ')[0] ?? '📦'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{item.name}</div>
                <div style={{ color: '#555', fontSize: '11px', marginTop: '1px' }}>{item.description}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#555', fontSize: '10px', background: '#222', padding: '1px 5px', borderRadius: '3px' }}>{item.category}</span>
                  <span style={{ color: '#555', fontSize: '10px', background: '#222', padding: '1px 5px', borderRadius: '3px' }}>Min T{item.min_tier}</span>
                  {item.quantity && <span style={{ color: '#555', fontSize: '10px', background: '#222', padding: '1px 5px', borderRadius: '3px' }}>Qty: {item.quantity}</span>}
                  {item.revenuecat_product_id && <span style={{ color: '#444', fontSize: '10px' }}>RC: {item.revenuecat_product_id}</span>}
                  <span style={{ color: '#555', fontSize: '10px', background: '#222', padding: '1px 5px', borderRadius: '3px' }}>Sort: {item.sort_order}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: item.price_type === 'real_money' ? '#B8860B' : '#00D4FF' }}>
                  {item.price_type === 'in_game_currency' ? `${item.price} OC` : `$${item.price}`}
                </div>
                <div style={{ color: item.active ? '#00AA44' : '#444', fontSize: '10px' }}>{item.active ? 'ACTIVE' : 'HIDDEN'}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => toggle(item)} style={{ background: '#111', color: item.active ? '#00AA44' : '#444', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '4px 9px', fontSize: '11px', cursor: 'pointer' }}>
                  {item.active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => { setIsNew(false); setEditing({ ...item }) }} style={{ background: '#111', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '4px 9px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(item.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444420', borderRadius: '4px', padding: '4px 9px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', width: '100%', maxWidth: '560px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: 'white', marginBottom: '20px' }}>
              {isNew ? 'CREATE STORE ITEM' : 'EDIT STORE ITEM'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>NAME</label><input value={editing.name ?? ''} onChange={e => upd('name', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>DESCRIPTION</label><textarea value={editing.description ?? ''} onChange={e => upd('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>CATEGORY</label>
                  <select value={editing.category ?? 'caps'} onChange={e => upd('category', e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>PRICE TYPE</label>
                  <select value={editing.price_type ?? 'in_game_currency'} onChange={e => upd('price_type', e.target.value)} style={inputStyle}>
                    <option value="in_game_currency">Omni-Credits (OC) — Pete's</option>
                    <option value="real_money">Real Money ($) — Notheby's</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>PRICE</label><input type="number" step="0.01" min="0" value={editing.price ?? 0} onChange={e => upd('price', +e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>MIN TIER</label><input type="number" min="0" max="4" value={editing.min_tier ?? 0} onChange={e => upd('min_tier', +e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>SORT ORDER</label><input type="number" value={editing.sort_order ?? 0} onChange={e => upd('sort_order', +e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>QUANTITY (null = unlimited)</label><input type="number" value={editing.quantity ?? ''} placeholder="unlimited" onChange={e => upd('quantity', e.target.value === '' ? null : +e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>ICON URL</label><input value={editing.icon_url ?? ''} onChange={e => upd('icon_url', e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>REVENUECAT PRODUCT ID</label><input value={editing.revenuecat_product_id ?? ''} onChange={e => upd('revenuecat_product_id', e.target.value)} placeholder="e.g. com.1775gaming.caps_100" style={inputStyle} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editing.active} onChange={e => upd('active', e.target.checked)} />
                <span style={{ color: '#C0C0C0', fontSize: '13px' }}>Active (visible in store)</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setEditing(null)} style={{ background: '#222', color: '#888', border: '1px solid #333', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 24px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', letterSpacing: '0.1em', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'SAVING…' : isNew ? 'CREATE' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
