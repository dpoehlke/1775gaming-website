'use client'
import { useState } from 'react'

// ── Tier data (matches omniverse-ascension/constants/tiers.ts exactly) ─────────
const TIERS = [
  {
    tier: 0, name: 'Free', price: 0, annualPrice: 0,
    capsPerDay: 10, maxCharacters: 1, color: '#6b7280',
    features: ['1 campaign slot', '~10 GM messages/day', '1 AI portrait/day', 'Basic character portrait', 'Standard campaigns'],
  },
  {
    tier: 1, name: 'Starter', price: 5.99, annualPrice: 57.50,
    capsPerDay: 25, maxCharacters: 3, color: '#3b82f6',
    features: ['3 campaign slots', '~25 GM messages/day', '4 AI portraits/day', 'Photo portrait upload', 'Piper TTS narration', 'All campaign types'],
  },
  {
    tier: 2, name: 'Hero', price: 11.99, annualPrice: 115.10,
    capsPerDay: 80, maxCharacters: 7, color: '#10b981',
    features: ['7 character slots', '~80 GM messages/day', '25 AI portraits/day', 'Persistent GM memory', 'Cloned voice narration', 'Custom portrait prompts', 'Enhanced Heroic Momentum'],
  },
  {
    tier: 3, name: 'Legend', price: 25.99, annualPrice: 249.50,
    capsPerDay: 250, maxCharacters: 12, color: '#f59e0b',
    features: ['12 character slots', '~250 GM messages/day', '60 AI portraits/day', 'Multiplayer campaign host', 'All voices + voice cloning', 'Priority campaign access', 'Maximum Heroic Momentum', 'Full Contact network'],
  },
  {
    tier: 4, name: 'Founder', price: 35.99, annualPrice: 345.50,
    capsPerDay: 500, maxCharacters: Infinity, color: '#8b5cf6',
    features: ['Everything in Legend', '~500 GM messages/day', '100 AI portraits/day', 'Priority model access (Sonnet 4.6)', 'Early M&M 4E content access', 'Named credit in app', 'Exclusive Founder cosmetics'],
  },
]

// ── Types ──────────────────────────────────────────────────────────────────────
type Sale = {
  id: string
  tier: number | null  // null = global
  discount_percent: number
  starts_at: string
  ends_at: string
  label: string | null
  created_at: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function isActive(s: Sale) {
  const now = Date.now()
  return new Date(s.starts_at).getTime() <= now && new Date(s.ends_at).getTime() > now
}

function effectiveDiscount(tierNum: number, sales: Sale[]): number {
  const activeSales = sales.filter(isActive)
  const globalDiscount = Math.max(0, ...activeSales.filter(s => s.tier === null).map(s => s.discount_percent))
  const tierDiscount = Math.max(0, ...activeSales.filter(s => s.tier === tierNum).map(s => s.discount_percent))
  return Math.max(globalDiscount, tierDiscount)
}

function salePrice(price: number, discount: number) {
  return (price * (1 - discount / 100)).toFixed(2)
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: '#1A1A1A', border: '1px solid #333', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px',
}
const LABEL: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
  display: 'block', marginBottom: '4px',
}
const btnBase: React.CSSProperties = {
  border: 'none', borderRadius: '4px', padding: '7px 14px', fontSize: '11px',
  fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em',
}

// ── Sale Form ──────────────────────────────────────────────────────────────────
function SaleForm({
  targetTier,  // undefined = this is the global form
  onCreated,
}: {
  targetTier?: number
  onCreated: (sale: Sale) => void
}) {
  const [discount, setDiscount] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    const body: Record<string, unknown> = {
      discount_percent: parseInt(discount, 10),
      ends_at: new Date(endsAt).toISOString(),
    }
    if (targetTier !== undefined) body.tier = targetTier
    if (label.trim()) body.label = label.trim()

    const res = await fetch('/api/admin/subscriptions/sales', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok || json.error) { setErr(json.error ?? 'Failed'); return }
    onCreated(json)
    setDiscount(''); setEndsAt(''); setLabel('')
  }

  const isGlobal = targetTier === undefined
  const accentColor = isGlobal ? '#CC0000' : (TIERS.find(t => t.tier === targetTier)?.color ?? '#888')

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div>
        <label style={LABEL}>% OFF</label>
        <input
          type="number" min="1" max="99" required
          value={discount} onChange={e => setDiscount(e.target.value)}
          placeholder="20" style={{ ...inputStyle, width: '70px' }}
        />
      </div>
      <div>
        <label style={LABEL}>ENDS AT</label>
        <input
          type="datetime-local" required
          value={endsAt} onChange={e => setEndsAt(e.target.value)}
          style={{ ...inputStyle }}
        />
      </div>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={LABEL}>LABEL (OPTIONAL)</label>
        <input
          value={label} onChange={e => setLabel(e.target.value)}
          placeholder={isGlobal ? 'e.g. Summer Sale' : `e.g. ${TIERS.find(t => t.tier === targetTier)?.name} promo`}
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <button type="submit" disabled={loading} style={{ ...btnBase, background: accentColor, color: 'white' }}>
          {loading ? 'SAVING…' : isGlobal ? '+ GLOBAL SALE' : '+ ADD SALE'}
        </button>
      </div>
      {err && <div style={{ color: '#CC4444', fontSize: '12px', width: '100%' }}>{err}</div>}
    </form>
  )
}

// ── Sale Row ───────────────────────────────────────────────────────────────────
function SaleRow({ sale, onCancel }: { sale: Sale; onCancel: (id: string) => void }) {
  const [cancelling, setCancelling] = useState(false)
  const active = isActive(sale)
  const tierName = sale.tier === null ? 'ALL TIERS' : `T${sale.tier} ${TIERS.find(t => t.tier === sale.tier)?.name ?? ''}`
  const color = sale.tier === null ? '#CC0000' : (TIERS.find(t => t.tier === sale.tier)?.color ?? '#888')

  async function cancel() {
    setCancelling(true)
    await fetch('/api/admin/subscriptions/sales', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sale.id }),
    })
    onCancel(sale.id)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px',
      background: active ? '#1A1A1A' : '#111', borderRadius: '6px',
      border: `1px solid ${active ? '#2A2A2A' : '#1A1A1A'}`,
      opacity: active ? 1 : 0.5,
    }}>
      <span style={{ color, fontFamily: 'Bebas Neue, sans-serif', fontSize: '13px', minWidth: '100px' }}>{tierName}</span>
      <span style={{ color: '#00AA44', fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', minWidth: '48px' }}>{sale.discount_percent}%</span>
      {sale.label && <span style={{ color: '#999', fontSize: '12px', flex: 1 }}>{sale.label}</span>}
      {!sale.label && <span style={{ flex: 1 }} />}
      <span style={{ color: '#444', fontSize: '11px' }}>
        {new Date(sale.starts_at).toLocaleDateString()} → {new Date(sale.ends_at).toLocaleDateString()}
      </span>
      {active ? (
        <span style={{ background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>LIVE</span>
      ) : (
        <span style={{ color: '#444', fontSize: '10px' }}>ENDED</span>
      )}
      {active && (
        <button onClick={cancel} disabled={cancelling}
          style={{ ...btnBase, background: '#2E0D0D', color: '#CC4444', padding: '4px 8px' }}>
          {cancelling ? '…' : 'END'}
        </button>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SubscriptionsClient({ initialSales }: { initialSales: Sale[] }) {
  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [showHistory, setShowHistory] = useState(false)

  function addSale(s: Sale) { setSales(prev => [s, ...prev]) }
  function cancelSale(id: string) {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ends_at: new Date().toISOString() } : s))
  }

  const activeSales = sales.filter(isActive)
  const pastSales = sales.filter(s => !isActive(s))

  return (
    <div>
      {/* ── Tier Cards ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {TIERS.map(tier => {
          const discount = effectiveDiscount(tier.tier, sales)
          const hasDiscount = discount > 0 && tier.price > 0
          const salePriceMonthly = hasDiscount ? salePrice(tier.price, discount) : null
          const salePriceAnnual = hasDiscount && tier.annualPrice > 0 ? salePrice(tier.annualPrice, discount) : null

          return (
            <div key={tier.tier} style={{
              background: '#1A1A1A', border: '1px solid #2A2A2A',
              borderTop: `3px solid ${tier.color}`, borderRadius: '8px', padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: tier.color, letterSpacing: '0.05em' }}>
                    {tier.name}
                  </div>
                  <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>Tier {tier.tier}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {tier.price === 0 ? (
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: 'white' }}>Free</div>
                  ) : (
                    <>
                      {hasDiscount && (
                        <div style={{ color: '#555', fontSize: '13px', textDecoration: 'line-through', lineHeight: 1 }}>
                          ${tier.price}/mo
                        </div>
                      )}
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: hasDiscount ? '#00AA44' : 'white', lineHeight: 1 }}>
                        {hasDiscount ? `$${salePriceMonthly}` : `$${tier.price}`}
                        <span style={{ fontSize: '14px', fontFamily: 'IBM Plex Sans, sans-serif', color: '#666', fontWeight: 400 }}>/mo</span>
                      </div>
                      {tier.annualPrice > 0 && (
                        <div style={{ color: hasDiscount ? '#00AA44' : '#555', fontSize: '11px' }}>
                          {hasDiscount ? `$${salePriceAnnual}` : `$${tier.annualPrice}`}/yr annual
                        </div>
                      )}
                    </>
                  )}
                  {hasDiscount && (
                    <div style={{ background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4440', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>
                      {discount}% OFF
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
                <div>
                  <div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em' }}>CAPS/DAY</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: tier.color }}>{tier.capsPerDay}</div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em' }}>MAX CHARS</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: tier.color }}>
                    {tier.maxCharacters === Infinity ? '∞' : tier.maxCharacters}
                  </div>
                </div>
              </div>

              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '12px', color: '#C0C0C0' }}>
                    <span style={{ color: tier.color, flexShrink: 0 }}>▸</span>{f}
                  </li>
                ))}
              </ul>

              {/* Per-tier sale form (tiers 1–4 only) */}
              {tier.tier > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #222' }}>
                  <div style={{ color: '#555', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>ADD TIER SALE</div>
                  <SaleForm targetTier={tier.tier} onCreated={addSale} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Global Sale ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: '3px solid #CC0000', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#CC0000' }}>GLOBAL SALE</div>
            <div style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>
              Applies a discount to all tiers simultaneously. Only the highest discount is used — global and per-tier sales do not stack.
            </div>
          </div>
          {activeSales.filter(s => s.tier === null).length > 0 && (
            <div style={{ background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>
              {activeSales.filter(s => s.tier === null).length} ACTIVE
            </div>
          )}
        </div>
        <SaleForm onCreated={addSale} />
      </div>

      {/* ── Active Sales ──────────────────────────────────────────────────────── */}
      {activeSales.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#B8860B', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '10px', fontWeight: 700 }}>ACTIVE SALES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeSales.map(s => <SaleRow key={s.id} sale={s} onCancel={cancelSale} />)}
          </div>
        </div>
      )}

      {/* ── History ───────────────────────────────────────────────────────────── */}
      {pastSales.length > 0 && (
        <div>
          <button onClick={() => setShowHistory(h => !h)}
            style={{ ...btnBase, background: 'transparent', color: '#444', border: '1px solid #2A2A2A', marginBottom: '10px' }}>
            {showHistory ? '▾' : '▸'} HISTORY ({pastSales.length})
          </button>
          {showHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pastSales.map(s => <SaleRow key={s.id} sale={s} onCancel={cancelSale} />)}
            </div>
          )}
        </div>
      )}

      {activeSales.length === 0 && pastSales.length === 0 && (
        <div style={{ color: '#333', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No sales created yet.</div>
      )}
    </div>
  )
}
