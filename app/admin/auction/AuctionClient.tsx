'use client'
import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────
type NothebysItem = {
  id: string; name: string; description: string; category: string
  price_usd: number; image_url: string | null; rarity: string
  badge_text: string | null; is_featured: boolean; is_active: boolean
  sort_order: number; stripe_price_id: string | null; omni_credit_value: number | null
}
type Sale = {
  id: string; item_id: string; item_type: string; item_name: string
  discount_percent: number; starts_at: string; ends_at: string
  label: string | null; created_at: string
}
type AuctionListing = { id: string; item_name: string; item_rarity: string; asking_price: number; status: string; sold_at?: string }
type Purchase = { id: string; item_name: string; category: string; price_paid: number; purchased_at: string }

// ── Constants ──────────────────────────────────────────────────────────────────
const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
  epic: '#a855f7', legendary: '#f59e0b', mythic: '#ef4444',
}
const CATEGORIES = ['omni_credits', 'loot_crates', 'powerups', 'reforge']
const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: '#111', border: '1px solid #333', color: 'white',
  padding: '7px 10px', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box',
}
const LABEL: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
  display: 'block', marginBottom: '3px',
}
const btnBase: React.CSSProperties = {
  border: 'none', borderRadius: '4px', padding: '6px 12px',
  fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em',
}
const TAB_NAMES = ['ANALYTICS', 'CATALOG', 'SALES'] as const
type Tab = typeof TAB_NAMES[number]

// ── Helpers ────────────────────────────────────────────────────────────────────
function isActive(s: Sale) {
  const now = Date.now()
  return new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() > now
}

// ── Item Form Modal ────────────────────────────────────────────────────────────
function ItemModal({
  item, onClose, onSaved,
}: {
  item: Partial<NothebysItem> | null
  onClose: () => void
  onSaved: (item: NothebysItem) => void
}) {
  const isNew = !item?.id
  const [form, setForm] = useState<Partial<NothebysItem>>(item ?? {
    name: '', description: '', category: 'omni_credits', price_usd: 0,
    rarity: 'common', is_featured: false, is_active: true, sort_order: 99,
    omni_credit_value: null, stripe_price_id: null, badge_text: null, image_url: null,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  function set(k: keyof NothebysItem, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setErr(''); setLoading(true)
    const method = isNew ? 'POST' : 'PATCH'
    const url = isNew
      ? '/api/admin/data/nothebys_items?project=omniverse'
      : `/api/admin/data/nothebys_items/${form.id}?project=omniverse`
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok || json.error) { setErr(json.error ?? 'Save failed'); return }
    onSaved(isNew ? json : { ...form, ...json } as NothebysItem)
    onClose()
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }
  const box: React.CSSProperties = {
    background: '#161616', border: '1px solid #2A2A2A', borderRadius: '10px',
    padding: '28px', width: '560px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
  }
  const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={box}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#B8860B', marginBottom: '20px' }}>
          {isNew ? 'NEW NOTHEBY\'S ITEM' : 'EDIT ITEM'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={LABEL}>NAME</label><input value={form.name ?? ''} onChange={e => set('name', e.target.value)} style={inputStyle} /></div>
          <div><label style={LABEL}>DESCRIPTION</label><textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>

          <div style={row2}>
            <div>
              <label style={LABEL}>CATEGORY</label>
              <select value={form.category ?? 'omni_credits'} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>RARITY</label>
              <select value={form.rarity ?? 'common'} onChange={e => set('rarity', e.target.value)} style={inputStyle}>
                {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={row2}>
            <div><label style={LABEL}>PRICE (USD)</label><input type="number" step="0.01" min="0" value={form.price_usd ?? 0} onChange={e => set('price_usd', parseFloat(e.target.value))} style={inputStyle} /></div>
            <div><label style={LABEL}>OMNI-CREDIT VALUE</label><input type="number" min="0" value={form.omni_credit_value ?? ''} onChange={e => set('omni_credit_value', e.target.value ? parseInt(e.target.value) : null)} placeholder="—" style={inputStyle} /></div>
          </div>

          <div style={row2}>
            <div><label style={LABEL}>BADGE TEXT</label><input value={form.badge_text ?? ''} onChange={e => set('badge_text', e.target.value || null)} placeholder="e.g. BEST VALUE" style={inputStyle} /></div>
            <div><label style={LABEL}>SORT ORDER</label><input type="number" value={form.sort_order ?? 99} onChange={e => set('sort_order', parseInt(e.target.value))} style={inputStyle} /></div>
          </div>

          <div><label style={LABEL}>IMAGE URL</label><input value={form.image_url ?? ''} onChange={e => set('image_url', e.target.value || null)} style={inputStyle} /></div>
          <div><label style={LABEL}>STRIPE PRICE ID</label><input value={form.stripe_price_id ?? ''} onChange={e => set('stripe_price_id', e.target.value || null)} style={inputStyle} /></div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', color: '#C0C0C0', fontSize: '13px' }}>
              <input type="checkbox" checked={form.is_active ?? true} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: '#00AA44' }} />
              Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', color: '#C0C0C0', fontSize: '13px' }}>
              <input type="checkbox" checked={form.is_featured ?? false} onChange={e => set('is_featured', e.target.checked)} style={{ accentColor: '#B8860B' }} />
              Featured
            </label>
          </div>
        </div>

        {err && <div style={{ color: '#CC4444', fontSize: '12px', marginTop: '12px' }}>{err}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button onClick={save} disabled={loading} style={{ ...btnBase, background: '#B8860B', color: 'black', flex: 1, padding: '10px' }}>
            {loading ? 'SAVING…' : isNew ? 'CREATE ITEM' : 'SAVE CHANGES'}
          </button>
          <button onClick={onClose} style={{ ...btnBase, background: '#222', color: '#666' }}>CANCEL</button>
        </div>
      </div>
    </div>
  )
}

// ── Sale Form (inline) ─────────────────────────────────────────────────────────
function SaleForm({ item, onCreated }: { item: NothebysItem; onCreated: (s: Sale) => void }) {
  const [discount, setDiscount] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [label, setLabel] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true)
    const res = await fetch('/api/admin/items/sales', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: item.id, item_type: 'nothebys', item_name: item.name,
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
      <button onClick={() => setOpen(true)} style={{ ...btnBase, background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4430', fontSize: '10px', padding: '4px 8px' }}>
        + SALE
      </button>
    )
  }

  return (
    <form onSubmit={submit} style={{ marginTop: '8px', padding: '10px', background: '#0D1A0D', borderRadius: '6px', border: '1px solid #00AA4420' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ width: '60px' }}>
          <label style={{ ...LABEL, color: '#00AA44' }}>% OFF</label>
          <input type="number" min="1" max="99" required value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20" style={{ ...inputStyle, background: '#111', padding: '5px 7px' }} />
        </div>
        <div>
          <label style={{ ...LABEL, color: '#00AA44' }}>ENDS AT</label>
          <input type="datetime-local" required value={endsAt} onChange={e => setEndsAt(e.target.value)} style={{ ...inputStyle, background: '#111', padding: '5px 7px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={{ ...LABEL, color: '#00AA44' }}>LABEL</label>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Optional note" style={{ ...inputStyle, background: '#111', padding: '5px 7px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ ...btnBase, background: '#00AA44', color: 'black' }}>
          {loading ? '…' : 'SAVE'}
        </button>
        <button type="button" onClick={() => setOpen(false)} style={{ ...btnBase, background: 'transparent', color: '#555' }}>✕</button>
      </div>
      {err && <div style={{ color: '#CC4444', fontSize: '11px', marginTop: '6px' }}>{err}</div>}
    </form>
  )
}

// ── Analytics Section ──────────────────────────────────────────────────────────
function Analytics({ items, purchases, auctions }: { items: NothebysItem[]; purchases: Purchase[]; auctions: AuctionListing[] }) {
  const activeLux = items.filter(i => i.is_active)
  const luxRevenue = purchases.reduce((s, p) => s + (p.price_paid ?? 0), 0)
  const luxSalesMap: Record<string, number> = {}
  purchases.forEach(p => { luxSalesMap[p.item_name] = (luxSalesMap[p.item_name] ?? 0) + 1 })
  const topItems = Object.entries(luxSalesMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const activeAuctions = auctions.filter(l => l.status === 'active')
  const soldAuctions = auctions.filter(l => l.status === 'sold')
  const auctionVolume = soldAuctions.reduce((s, l) => s + (l.asking_price ?? 0), 0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'LUXURY REVENUE', value: `$${luxRevenue.toFixed(2)}`, color: '#B8860B' },
          { label: 'LUXURY SALES', value: purchases.length, color: '#B8860B' },
          { label: 'ACTIVE ITEMS', value: activeLux.length, color: '#00AA44' },
          { label: 'ACTIVE LISTINGS', value: activeAuctions.length, color: '#3b82f6' },
          { label: 'AUCTION VOLUME', value: `${auctionVolume} OC`, color: '#10b981' },
          { label: 'AUCTIONS SOLD', value: soldAuctions.length, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Top sellers */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '14px' }}>TOP SELLERS</div>
          {topItems.length === 0
            ? <div style={{ color: '#444', fontSize: '13px' }}>No purchases yet.</div>
            : topItems.map(([name, count], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ color: '#333', fontSize: '11px', width: '18px' }}>#{i + 1}</span>
                <span style={{ flex: 1, color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span style={{ color: '#B8860B', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px' }}>{count}×</span>
                <div style={{ width: '36px', height: '4px', background: '#2A2A2A', borderRadius: '2px' }}>
                  <div style={{ height: '100%', background: '#B8860B', borderRadius: '2px', width: `${(count / (topItems[0]?.[1] ?? 1)) * 100}%` }} />
                </div>
              </div>
            ))}
        </div>

        {/* Recent purchases */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '14px' }}>RECENT PURCHASES</div>
          {purchases.length === 0
            ? <div style={{ color: '#444', fontSize: '13px' }}>No purchases yet.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflowY: 'auto' }}>
              {purchases.slice(0, 20).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <span style={{ flex: 1, color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.item_name}</span>
                  <span style={{ color: '#B8860B', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>${p.price_paid}</span>
                  <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>}
        </div>

        {/* Active auction listings */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#3b82f6', marginBottom: '14px' }}>ACTIVE LISTINGS ({activeAuctions.length})</div>
          {activeAuctions.length === 0
            ? <div style={{ color: '#444', fontSize: '13px' }}>No active listings.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflowY: 'auto' }}>
              {activeAuctions.map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.item_name}</div>
                    <div style={{ color: RARITY_COLORS[l.item_rarity] ?? '#888', fontSize: '10px' }}>{l.item_rarity}</div>
                  </div>
                  <span style={{ color: '#3b82f6', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>{l.asking_price} OC</span>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  )
}

// ── Catalog Section ────────────────────────────────────────────────────────────
function Catalog({ items: initial, sales, onSaleCreated }: { items: NothebysItem[]; sales: Sale[]; onSaleCreated: (s: Sale) => void }) {
  const [items, setItems] = useState(initial)
  const [editItem, setEditItem] = useState<Partial<NothebysItem> | null>(null)
  const [filterCat, setFilterCat] = useState('all')
  const [toggling, setToggling] = useState<string | null>(null)

  function upsert(item: NothebysItem) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      return idx >= 0 ? prev.map((i, n) => n === idx ? item : i) : [item, ...prev]
    })
  }

  async function toggleActive(item: NothebysItem) {
    setToggling(item.id)
    await fetch(`/api/admin/data/nothebys_items/${item.id}?project=omniverse`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i))
    setToggling(null)
  }

  async function deleteItem(item: NothebysItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    await fetch(`/api/admin/data/nothebys_items/${item.id}?project=omniverse`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  // Build active sale map: item_id → discount
  const activeSaleMap: Record<string, number> = {}
  sales.filter(isActive).forEach(s => { activeSaleMap[s.item_id] = s.discount_percent })

  const filtered = items.filter(i => filterCat === 'all' || i.category === filterCat)

  return (
    <div>
      {editItem !== null && (
        <ItemModal item={editItem} onClose={() => setEditItem(null)} onSaved={item => { upsert(item); setEditItem(null) }} />
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setEditItem({})} style={{ ...btnBase, background: '#B8860B', color: 'black' }}>+ NEW ITEM</button>
        <span style={{ color: '#444', fontSize: '12px', marginLeft: 'auto' }}>{filtered.length} items</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {filtered.map(item => {
          const discount = activeSaleMap[item.id] ?? 0
          const salePrice = discount > 0 ? (item.price_usd * (1 - discount / 100)).toFixed(2) : null
          const rarityColor = RARITY_COLORS[item.rarity] ?? '#888'

          return (
            <div key={item.id} style={{
              background: '#1A1A1A', border: `1px solid #2A2A2A`,
              borderTop: `3px solid ${rarityColor}`, borderRadius: '8px', padding: '16px',
              opacity: item.is_active ? 1 : 0.55,
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                {item.image_url && (
                  <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{item.name}</span>
                    {item.is_featured && <span style={{ color: '#B8860B', fontSize: '11px' }}>★</span>}
                    {discount > 0 && (
                      <span style={{ background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4430', borderRadius: '3px', padding: '1px 5px', fontSize: '10px' }}>
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div style={{ color: rarityColor, fontSize: '10px', marginTop: '1px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.rarity} · {item.category}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {item.price_usd > 0 && (
                    <>
                      {salePrice && <div style={{ color: '#555', fontSize: '11px', textDecoration: 'line-through' }}>${item.price_usd.toFixed(2)}</div>}
                      <div style={{ color: salePrice ? '#00AA44' : '#B8860B', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', lineHeight: 1 }}>
                        ${salePrice ?? item.price_usd.toFixed(2)}
                      </div>
                    </>
                  )}
                  {item.omni_credit_value && (
                    <div style={{ color: '#3b82f6', fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>{item.omni_credit_value} OC</div>
                  )}
                </div>
              </div>

              {item.description && (
                <div style={{ color: '#666', fontSize: '11px', marginBottom: '10px', lineHeight: 1.4 }}>{item.description}</div>
              )}

              {item.badge_text && (
                <div style={{ display: 'inline-block', background: '#1A1400', color: '#B8860B', border: '1px solid #B8860B40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px', marginBottom: '8px' }}>
                  {item.badge_text}
                </div>
              )}

              {/* Action row */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #222' }}>
                <button onClick={() => setEditItem(item)} style={{ ...btnBase, background: '#222', color: '#999', fontSize: '10px', padding: '4px 8px' }}>EDIT</button>
                <button onClick={() => toggleActive(item)} disabled={toggling === item.id} style={{ ...btnBase, background: item.is_active ? '#1F0D0D' : '#0D1A0D', color: item.is_active ? '#CC4444' : '#00AA44', fontSize: '10px', padding: '4px 8px' }}>
                  {toggling === item.id ? '…' : item.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                </button>
                <button onClick={() => deleteItem(item)} style={{ ...btnBase, background: '#1F0D0D', color: '#883333', fontSize: '10px', padding: '4px 8px' }}>DEL</button>
                <div style={{ marginLeft: 'auto' }}>
                  <SaleForm item={item} onCreated={onSaleCreated} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Sales Section ──────────────────────────────────────────────────────────────
function SalesTab({ sales: initial }: { sales: Sale[] }) {
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
          <div style={{ color: '#B8860B', fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '10px' }}>
            ACTIVE SALES ({active.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {active.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '10px 14px' }}>
                <span style={{ color: '#00AA44', fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', minWidth: '48px' }}>{s.discount_percent}%</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{s.item_name}</div>
                  {s.label && <div style={{ color: '#555', fontSize: '11px' }}>{s.label}</div>}
                </div>
                <div style={{ color: '#444', fontSize: '11px', textAlign: 'right', flexShrink: 0 }}>
                  <div>{new Date(s.starts_at).toLocaleDateString()} →</div>
                  <div>{new Date(s.ends_at).toLocaleDateString()}</div>
                </div>
                <span style={{ background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4430', borderRadius: '3px', padding: '1px 6px', fontSize: '10px', flexShrink: 0 }}>LIVE</span>
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

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AuctionClient({
  initialItems, initialPurchases, initialAuctions, initialSales,
}: {
  initialItems: NothebysItem[]
  initialPurchases: Purchase[]
  initialAuctions: AuctionListing[]
  initialSales: Sale[]
}) {
  const [tab, setTab] = useState<Tab>('ANALYTICS')
  const [sales, setSales] = useState<Sale[]>(initialSales)

  function addSale(s: Sale) { setSales(prev => [s, ...prev]) }

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #2A2A2A', paddingBottom: '0' }}>
        {TAB_NAMES.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...btnBase, background: 'transparent', color: tab === t ? '#B8860B' : '#444',
            borderBottom: tab === t ? '2px solid #B8860B' : '2px solid transparent',
            borderRadius: 0, padding: '8px 16px', fontSize: '12px',
          }}>
            {t}
            {t === 'SALES' && sales.filter(isActive).length > 0 && (
              <span style={{ marginLeft: '6px', background: '#0D1A0D', color: '#00AA44', borderRadius: '10px', padding: '1px 6px', fontSize: '9px' }}>
                {sales.filter(isActive).length}
              </span>
            )}
            {t === 'CATALOG' && (
              <span style={{ marginLeft: '6px', color: '#333', fontSize: '9px' }}>{initialItems.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'ANALYTICS' && <Analytics items={initialItems} purchases={initialPurchases} auctions={initialAuctions} />}
      {tab === 'CATALOG' && <Catalog items={initialItems} sales={sales} onSaleCreated={addSale} />}
      {tab === 'SALES' && <SalesTab sales={sales} />}
    </div>
  )
}
