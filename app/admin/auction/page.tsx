/**
 * /admin/auction — Notheby's: luxury store + player auction + real-money microtransactions.
 *
 * nothebys_items (10 rows)  — luxury catalog (real money + OC)
 * nothebys_purchases        — luxury purchase history
 * auction_listings          — player-to-player auction
 * purchases WHERE price_type = 'real_money'  — real money micro-transactions
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'

export default async function AuctionPage() {
  const [luxItemsRes, luxPurchRes, auctionRes, realTxRes] = await Promise.all([
    omniverseAdmin.from('nothebys_items').select('*').order('sort_order'),
    omniverseAdmin.from('nothebys_purchases').select('*').order('purchased_at', { ascending: false }).limit(200),
    omniverseAdmin.from('auction_listings').select('*').order('created_at', { ascending: false }).limit(200),
    omniverseAdmin.from('purchases').select('*').eq('price_type', 'real_money').order('created_at', { ascending: false }).limit(200),
  ])

  const luxItems = luxItemsRes.data ?? []
  const luxPurchases = luxPurchRes.data ?? []
  const auctionListings = auctionRes.data ?? []
  const realTx = realTxRes.data ?? []

  // Luxury store metrics
  const activeLux = luxItems.filter(i => i.is_active)
  const luxRevenue = luxPurchases.reduce((s, p) => s + (p.price_paid ?? 0), 0)

  // Sales per luxury item
  const luxSalesMap: Record<string, number> = {}
  luxPurchases.forEach(p => { luxSalesMap[p.item_name ?? ''] = (luxSalesMap[p.item_name ?? ''] ?? 0) + 1 })

  // Auction metrics
  const activeAuctions = auctionListings.filter(l => l.status === 'active')
  const soldAuctions = auctionListings.filter(l => l.status === 'sold')
  const auctionVolume = soldAuctions.reduce((s, l) => s + (l.asking_price ?? 0), 0)

  // Real money micro-transaction metrics
  const realRevenue = realTx.reduce((s, p) => s + ((p.amount_paid ?? 0) * (p.quantity ?? 1)), 0)
  const realSalesMap: Record<string, number> = {}
  realTx.forEach(p => { realSalesMap[p.item_name ?? ''] = (realSalesMap[p.item_name ?? ''] ?? 0) + (p.quantity ?? 1) })
  const topRealItems = Object.entries(realSalesMap).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const RARITY_COLORS: Record<string, string> = { common: '#888', uncommon: '#00AA44', rare: '#00D4FF', epic: '#8844CC', legendary: '#B8860B' }

  const card = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px', letterSpacing: '0.08em' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>NOTHEBY'S</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>Luxury store · Player auction · Real-money microtransactions</p>

      {/* Top-level summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: 'LUXURY REVENUE', value: `$${luxRevenue.toFixed(2)}`, color: '#B8860B' },
          { label: 'LUXURY SALES', value: luxPurchases.length, color: '#B8860B' },
          { label: 'ACTIVE LISTINGS', value: activeAuctions.length, color: '#00D4FF' },
          { label: 'AUCTION VOLUME', value: `${auctionVolume} OC`, color: '#00AA44' },
          { label: 'MICRO-TX REVENUE', value: `$${realRevenue.toFixed(2)}`, color: '#CC0000' },
          { label: 'MICRO-TX COUNT', value: realTx.length, color: '#CC0000' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: LUXURY STORE ── */}
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#B8860B', letterSpacing: '0.12em', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid #2A2A2A' }}>
        🏛️ LUXURY STORE
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: '28px' }}>

        {card('CATALOG (' + activeLux.length + ' ACTIVE / ' + luxItems.length + ' TOTAL)', (
          luxItems.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No luxury items yet.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {luxItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #1F1F1F' }}>
                  {item.image_url && <img src={item.image_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ color: '#555', fontSize: '10px' }}>{item.category} · {item.badge_text ?? ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {item.price_usd > 0 && <div style={{ color: '#B8860B', fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>${item.price_usd}</div>}
                    {item.omni_credit_value > 0 && <div style={{ color: '#00D4FF', fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>{item.omni_credit_value} OC</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.is_active ? '#00AA44' : '#333' }} />
                    {item.is_featured && <span style={{ color: '#B8860B', fontSize: '9px' }}>★</span>}
                    {luxSalesMap[item.name] > 0 && <span style={{ color: '#B8860B', fontSize: '10px' }}>{luxSalesMap[item.name]}×</span>}
                  </div>
                </div>
              ))}
            </div>
          )
        ))}

        {card('RECENT LUXURY PURCHASES', (
          luxPurchases.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No luxury purchases yet.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {luxPurchases.slice(0, 20).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.item_name}</div>
                    <div style={{ color: '#555', fontSize: '10px' }}>{p.category}</div>
                  </div>
                  <span style={{ color: '#B8860B', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>${p.price_paid}</span>
                  <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>{p.purchased_at ? new Date(p.purchased_at).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      {/* ── SECTION 2: PLAYER AUCTION ── */}
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#00D4FF', letterSpacing: '0.12em', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid #2A2A2A' }}>
        🔨 PLAYER AUCTION HOUSE
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: '28px' }}>

        {card(`ACTIVE LISTINGS (${activeAuctions.length})`, (
          activeAuctions.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No active listings.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '260px', overflowY: 'auto' }}>
              {activeAuctions.map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.item_name}</div>
                    <div style={{ color: RARITY_COLORS[l.item_rarity] ?? '#888', fontSize: '10px' }}>{l.item_rarity}</div>
                  </div>
                  <span style={{ color: '#00D4FF', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif' }}>{l.asking_price} OC</span>
                </div>
              ))}
            </div>
          )
        ))}

        {card(`SOLD (${soldAuctions.length}) · ${auctionVolume} OC VOLUME`, (
          soldAuctions.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No auction sales yet.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '260px', overflowY: 'auto' }}>
              {soldAuctions.slice(0, 20).map(l => (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.item_name}</div>
                    <div style={{ color: RARITY_COLORS[l.item_rarity] ?? '#888', fontSize: '10px' }}>{l.item_rarity}</div>
                  </div>
                  <span style={{ color: '#00AA44', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif' }}>{l.asking_price} OC</span>
                  <span style={{ color: '#444', fontSize: '11px' }}>{l.sold_at ? new Date(l.sold_at).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      {/* ── SECTION 3: REAL MONEY MICRO-TX ── */}
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#CC0000', letterSpacing: '0.12em', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid #2A2A2A' }}>
        💳 REAL MONEY MICROTRANSACTIONS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>

        {card('TOP ITEMS BY UNITS SOLD', (
          topRealItems.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No real money transactions yet.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topRealItems.map(([name, count], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#333', fontSize: '11px', width: '18px' }}>#{i + 1}</span>
                  <span style={{ flex: 1, color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <span style={{ color: '#CC0000', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px' }}>{count}×</span>
                  <div style={{ width: '40px', height: '4px', background: '#2A2A2A', borderRadius: '2px' }}>
                    <div style={{ height: '100%', background: '#CC0000', borderRadius: '2px', width: `${(count / (topRealItems[0]?.[1] ?? 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )
        ))}

        {card('RECENT TRANSACTIONS', (
          realTx.length === 0 ? <div style={{ color: '#444', fontSize: '13px' }}>No real money transactions yet.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '260px', overflowY: 'auto' }}>
              {realTx.slice(0, 20).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0', borderBottom: '1px solid #1F1F1F' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.item_name}</div>
                    <div style={{ color: '#555', fontSize: '10px' }}>{p.category}</div>
                  </div>
                  <span style={{ color: '#CC0000', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif', flexShrink: 0 }}>${(p.amount_paid ?? 0) * (p.quantity ?? 1)}</span>
                  <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  )
}
