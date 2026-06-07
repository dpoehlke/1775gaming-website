'use client'
import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────
type StoreItem = {
  id: string; name: string; description: string | null; category: string
  price: number; price_type: string; quantity: number | null; active: boolean
  sort_order: number; icon_url: string | null; min_tier: number; revenuecat_product_id: string | null
}
type Sale = {
  id: string; item_id: string; item_type: string; item_name: string
  discount_percent: number; starts_at: string; ends_at: string
  label: string | null; created_at: string
}
type Purchase = {
  id: string; item_name: string; category: string
  amount_paid: number; quantity: number; status: string; created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────────
const OC_CATEGORIES = ['caps', 'victory_points', 'character_points', 'currency', 'sidekick', 'team_up', 'contact', 'portrait']
const CAT_COLORS: Record<string, string> = {
  caps: '#3b82f6', victory_points: '#a855f7', character_points: '#f59e0b',
  currency: '#10b981', sidekick: '#ec4899', team_up: '#ef4444', contact: '#9ca3af', portrait: '#06b6d4',
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: '#111', border: '1px solid #333', color: 'white',
  padding: '7px 10px', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box',
}
const LABEL: React.CSSProperties = {
  color: '#3b82f6', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
  display: 'block', marginBottom: '3px',
}
const btnBase: React.CSSProperties = {
  border: 'none', borderRadius: '4px', padding: '6px 12px',
  fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em',
}
const TAB_NAMES = ['ANALYTICS', 'CATALOG', 'SALES'] as const
type Tab = typeof TAB_NAMES[number]

function isActive(s: Sale) {
  const now = Date.now()
  return new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() > now
}

// ── Item Modal ─────────────────────────────────────────────────────────────────
function ItemModal({ item, onClose, onSaved }: { item: Partial<StoreItem> | null; onClose: () => void; onSaved: (i: StoreItem) => void }) {
  const isNew = !item?.id
  const [form, setForm] = useState<Partial<StoreItem>>(item ?? {
    name: '', description: null, category: 'currency', price: 0,
    price_type: 'in_game_currency', quantity: null, active: true, sort_order: 99,
    min_tier: 0, icon_url: null, revenuecat_product_id: null,
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  function set(k: keyof StoreItem, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    setErr(''); setLoading(true)
    const method = isNew ? 'POST' : 'PATCH'
    const url = isNew
      ? '/api/admin/data/store_items?project=omniverse'
      : `/api/admin/data/store_items/${form.id}?project=omniverse`
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok || json.error) { setErr(json.error ?? 'Save failed'); return }
    onSaved(isNew ? json : { ...form, ...json } as StoreItem)
    onClose()
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  }
  const box: React.CSSProperties = {
    background: '#161616', border: '1px solid #2A2A2A', borderRadius: '10px',
    padding: '28px', width: '500px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
  }
  const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={box}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#3b82f6', marginBottom: '20px' }}>
          {isNew ? 'NEW SHOP ITEM' : 'EDIT ITEM'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={LABEL}>NAME</label><input value={form.name ?? ''} onChange={e => set('name', e.target.value)} style={inputStyle} /></div>
          <div><label style={LABEL}>DESCRIPTION</label><textarea value={form.description ?? ''} onChange={e => set('description', e.target.value || null)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
          <div style={row2}>
            <div>
              <label style={LABEL}>CATEGORY</label>
              <select value={form.category ?? 'currency'} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {OC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>OC PRICE</label>
              <input type="number" min="0" value={form.price ?? 0} onChange={e => set('price', parseInt(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div style={row2}>
            <div>
              <label style={LABEL}>MIN TIER</label>
              <select value={form.min_tier ?? 0} onChange={e => set('min_tier', parseInt(e.target.value))} style={inputStyle}>
                {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>T{n}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>SORT ORDER</label>
              <input type="number" value={form.sort_order ?? 99} onChange={e => set('sort_order', parseInt(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div><label style={LABEL}>ICON URL</label><input value={form.icon_url ?? ''} onChange={e => set('icon_url', e.target.value || null)} style={inputStyle} /></div>
          <div><label style={LABEL}>QUANTITY (blank = unlimited)</label><input type="number" min="0" value={form.quantity ?? ''} onChange={e => set('quantity', e.target.value ? parseInt(e.target.value) : null)} placeholder="—" style={inputStyle} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', color: '#C0C0C0', fontSize: '13px' }}>
            <input type="checkbox" checked={form.active ?? true} onChange={e => set('active', e.target.checked)} style={{ accentColor: '#00AA44' }} />
            Active
          </label>
        </div>
        {err && <div style={{ color: '#CC4444', fontSize: '12px', marginTop: '12px' }}>{err}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button onClick={save} disabled={loading} style={{ ...btnBase, background: '#3b82f6', color: 'white', flex: 1, padding: '10px' }}>
            {loading ? 'SAVING…' : isNew ? 'CREATE ITEM' : 'SAVE CHANGES'}
          </button>
          <button onClick={onClose} style={{ ...btnBase, background: '#222', color: '#666' }}>CANCEL</button>
        </div>
      </div>
    </div>
  )
}

// ── Inline Sale Form ───────────────────────────────────────────────────────────
function SaleForm({ item, onCreated }: { item: StoreItem; onCreated: (s: Sale) => void }) {
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
        item_id: item.id, item_type: 'store', item_name: item.name,
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
      <button onClick={() => setOpen(true)} style={{ ...btnBase, background: '#0D1520', color: '#3b82f6', border: '1px solid #3b82f620', fontSize: '10px', padding: '4px 8px' }}>
        + SALE
      </button>
    )
  }

  return (
    <form onSubmit={submit} style={{ marginTop: '8px', padding: '10px', background: '#0D1520', borderRadius: '6px', border: '1px solid #3b82f620' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ width: '60px' }}>
          <label style={{ ...LABEL }}>% OFF</label>
          <input type="number" min="1" max="99" required value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20" style={{ ...inputStyle, background: '#111', padding: '5px 7px' }} />
        </div>
        <div>
          <label style={{ ...LABEL }}>ENDS AT</label>
          <input type="datetime-local" required value={endsAt} onChange={e => setEndsAt(e.target.value)} style={{ ...inputStyle, background: '#111', padding: '5px 7px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label style={{ ...LABEL }}>LABEL</label>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Optional note" style={{ ...inputStyle, background: '#111', padding: '5px 7px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ ...btnBase, background: '#3b82f6', color: 'white' }}>{loading ? '…' : 'SAVE'}</button>
        <button type="button" onClick={() => setOpen(false)} style={{ ...btnBase, background: 'transparent', color: '#555' }}>✕</button>
      </div>
      {err && <div style={{ color: '#CC4444', fontSize: '11px', marginTop: '6px' }}>{err}</div>}
    </form>
  )
}

// ── Analytics Section ──────────────────────────────────────────────────────────
function Analytics({ items, purchases }: { items: StoreItem[]; purchases: Purchase[] }) {
  const completed = purchases.filter(p => !p.status || p.status === 'completed' || p.status === 'success')
  const totalOC = completed.reduce((s, p) => s + (p.amount_paid ?? 0) * (p.quantity ?? 1), 0)
  const salesMap: Record<string, { count: number; oc: number }> = {}
  completed.forEach(p => {
    const k = p.item_name ?? 'Unknown'
    if (!salesMap[k]) salesMap[k] = { count: 0, oc: 0 }
    salesMap[k].count += p.quantity ?? 1
    salesMap[k].oc += (p.amount_paid ?? 0) * (p.quantity ?? 1)
  })
  const topSellers = Object.entries(salesMap).sort((a, b) => b[1].count - a[1].count).slice(0, 10)
  const catMap: Record<string, number> = {}
  completed.forEach(p => { const k = p.category ?? 'other'; catMap[k] = (catMap[k] ?? 0) + 1 })

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'CATALOG ITEMS', value: items.length, color: '#3b82f6' },
          { label: 'ACTIVE ITEMS', value: items.filter(i => i.active).length, color: '#00AA44' },
          { label: 'TRANSACTIONS', value: completed.length, color: '#f59e0b' },
          { label: 'TOTAL OC SPENT', value: totalOC.toLocaleString(), color: '#f59e0b' },
          { label: 'AVG ORDER (OC)', value: completed.length > 0 ? Math.round(totalOC / completed.length) : 0, color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#f59e0b', marginBottom: '14px' }}>TOP SELLING ITEMS</div>
          {topSellers.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No transactions yet.</div> : topSellers.map(([name, stats], i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
              <span style={{ color: '#333', fontSize: '11px', width: '18px' }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                <div style={{ color: '#3b82f6', fontSize: '10px' }}>{stats.oc.toLocaleString()} OC total</div>
              </div>
              <span style={{ color: '#f59e0b', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', flexShrink: 0 }}>{stats.count}×</span>
              <div style={{ width: '36px', height: '4px', background: '#2A2A2A', borderRadius: '2px', flexShrink: 0 }}>
                <div style={{ height: '100%', background: '#f59e0b', borderRadius: '2px', width: `${(stats.count / (topSellers[0]?.[1].count ?? 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#f59e0b', marginBottom: '14px' }}>SALES BY CATEGORY</div>
          {Object.keys(catMap).length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No transactions yet.</div> :
            Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const pct = Math.round((count / completed.length) * 100)
              const color = CAT_COLORS[cat] ?? '#888'
              return (
                <div key={cat} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color, fontSize: '12px' }}>{cat}</span>
                    <span style={{ color: '#555', fontSize: '11px' }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#222', borderRadius: '2px' }}>
                    <div style={{ height: '100%', background: color, borderRadius: '2px', width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
        </div>

        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#f59e0b', marginBottom: '14px' }}>RECENT TRANSACTIONS</div>
          {completed.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No transactions yet.</div> :
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '260px', overflowY: 'auto' }}>
              {completed.slice(0, 25).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.item_name}</div>
                    <div style={{ color: '#444', fontSize: '10px' }}>{p.category}</div>
                  </div>
                  <span style={{ color: '#3b82f6', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>{(p.amount_paid ?? 0) * (p.quantity ?? 1)} OC</span>
                  <span style={{ color: '#333', fontSize: '11px', flexShrink: 0 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  )
}

// ── Catalog Section ────────────────────────────────────────────────────────────
function Catalog({ items: initial, sales, onSaleCreated }: { items: StoreItem[]; sales: Sale[]; onSaleCreated: (s: Sale) => void }) {
  const [items, setItems] = useState(initial)
  const [editItem, setEditItem] = useState<Partial<StoreItem> | null>(null)
  const [filterCat, setFilterCat] = useState('all')
  const [toggling, setToggling] = useState<string | null>(null)

  function upsert(item: StoreItem) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      return idx >= 0 ? prev.map((i, n) => n === idx ? item : i) : [item, ...prev]
    })
  }

  async function toggleActive(item: StoreItem) {
    setToggling(item.id)
    await fetch(`/api/admin/data/store_items/${item.id}?project=omniverse`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !item.active }),
    })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))
    setToggling(null)
  }

  async function deleteItem(item: StoreItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    await fetch(`/api/admin/data/store_items/${item.id}?project=omniverse`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  const activeSaleMap: Record<string, number> = {}
  sales.filter(isActive).forEach(s => { activeSaleMap[s.item_id] = s.discount_percent })

  const filtered = items.filter(i => filterCat === 'all' || i.category === filterCat)
  const catColor = (cat: string) => CAT_COLORS[cat] ?? '#888'

  return (
    <div>
      {editItem !== null && (
        <ItemModal item={editItem} onClose={() => setEditItem(null)} onSaved={item => { upsert(item); setEditItem(null) }} />
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: 'auto', background: '#1A1A1A', border: '1px solid #333' }}>
          <option value="all">All Categories</option>
          {OC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setEditItem({})} style={{ ...btnBase, background: '#3b82f6', color: 'white' }}>+ NEW ITEM</button>
        <span style={{ color: '#444', fontSize: '12px', marginLeft: 'auto' }}>{filtered.length} items</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {filtered.map(item => {
          const discount = activeSaleMap[item.id] ?? 0
          const salePrice = discount > 0 ? Math.round(item.price * (1 - discount / 100)) : null
          const color = catColor(item.category)

          return (
            <div key={item.id} style={{
              background: '#1A1A1A', border: '1px solid #2A2A2A',
              borderTop: `3px solid ${color}`, borderRadius: '8px', padding: '14px',
              opacity: item.active ? 1 : 0.55,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                {item.icon_url && <img src={item.icon_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{item.name}</span>
                    {discount > 0 && (
                      <span style={{ background: '#0D1520', color: '#3b82f6', border: '1px solid #3b82f630', borderRadius: '3px', padding: '1px 5px', fontSize: '10px' }}>
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div style={{ color, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1px' }}>
                    {item.category} · T{item.min_tier}+
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {salePrice !== null && <div style={{ color: '#444', fontSize: '11px', textDecoration: 'line-through' }}>{item.price} OC</div>}
                  <div style={{ color: salePrice !== null ? '#3b82f6' : color, fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', lineHeight: 1 }}>
                    {salePrice ?? item.price} OC
                  </div>
                </div>
              </div>

              {item.description && (
                <div style={{ color: '#555', fontSize: '11px', marginBottom: '8px', lineHeight: 1.4 }}>{item.description}</div>
              )}

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #222' }}>
                <button onClick={() => setEditItem(item)} style={{ ...btnBase, background: '#222', color: '#888', fontSize: '10px', padding: '4px 8px' }}>EDIT</button>
                <button onClick={() => toggleActive(item)} disabled={toggling === item.id} style={{ ...btnBase, background: item.active ? '#1F0D0D' : '#0D1A0D', color: item.active ? '#CC4444' : '#00AA44', fontSize: '10px', padding: '4px 8px' }}>
                  {toggling === item.id ? '…' : item.active ? 'DEACTIVATE' : 'ACTIVATE'}
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
          <div style={{ color: '#3b82f6', fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '10px' }}>ACTIVE SALES ({active.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {active.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '10px 14px' }}>
                <span style={{ color: '#3b82f6', fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', minWidth: '48px' }}>{s.discount_percent}%</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{s.item_name}</div>
                  {s.label && <div style={{ color: '#555', fontSize: '11px' }}>{s.label}</div>}
                </div>
                <div style={{ color: '#444', fontSize: '11px', textAlign: 'right', flexShrink: 0 }}>
                  <div>{new Date(s.starts_at).toLocaleDateString()} →</div>
                  <div>{new Date(s.ends_at).toLocaleDateString()}</div>
                </div>
                <span style={{ background: '#0D1520', color: '#3b82f6', border: '1px solid #3b82f630', borderRadius: '3px', padding: '1px 6px', fontSize: '10px', flexShrink: 0 }}>LIVE</span>
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
export default function PawnshopClient({
  initialItems, initialPurchases, initialSales, dbError,
}: {
  initialItems: StoreItem[]
  initialPurchases: Purchase[]
  initialSales: Sale[]
  dbError?: string
}) {
  const [tab, setTab] = useState<Tab>('ANALYTICS')
  const [sales, setSales] = useState<Sale[]>(initialSales)

  if (dbError) {
    return (
      <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', borderRadius: '8px', padding: '20px', color: '#CC4444' }}>
        {dbError.includes('JWT') ? 'OMNIVERSE_SERVICE_ROLE_KEY not set — add to .env.local and Vercel.' : dbError}
      </div>
    )
  }

  function addSale(s: Sale) { setSales(prev => [s, ...prev]) }

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #2A2A2A' }}>
        {TAB_NAMES.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...btnBase, background: 'transparent', color: tab === t ? '#3b82f6' : '#444',
            borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
            borderRadius: 0, padding: '8px 16px', fontSize: '12px',
          }}>
            {t}
            {t === 'SALES' && sales.filter(isActive).length > 0 && (
              <span style={{ marginLeft: '6px', background: '#0D1520', color: '#3b82f6', borderRadius: '10px', padding: '1px 6px', fontSize: '9px' }}>
                {sales.filter(isActive).length}
              </span>
            )}
            {t === 'CATALOG' && (
              <span style={{ marginLeft: '6px', color: '#333', fontSize: '9px' }}>{initialItems.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'ANALYTICS' && <Analytics items={initialItems} purchases={initialPurchases} />}
      {tab === 'CATALOG' && <Catalog items={initialItems} sales={sales} onSaleCreated={addSale} />}
      {tab === 'SALES' && <SalesTab sales={sales} />}
    </div>
  )
}
