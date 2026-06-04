/**
 * /admin/pawnshop — Pete's Pawn Shop analytics.
 * "All items purchasable with in-game currency (OC)."
 *
 * store_items WHERE price_type = 'in_game_currency' → catalog
 * purchases WHERE price_type = 'in_game_currency' → transaction log
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'

export default async function PawnShopPage() {
  const [itemsRes, txRes] = await Promise.all([
    omniverseAdmin.from('store_items').select('id, name, description, category, price, price_type, active, sort_order, icon_url, min_tier').eq('price_type', 'in_game_currency').order('sort_order'),
    omniverseAdmin.from('purchases').select('id, item_name, category, amount_paid, price_type, quantity, status, created_at').eq('price_type', 'in_game_currency').order('created_at', { ascending: false }).limit(500),
  ])

  const items = itemsRes.data ?? []
  const purchases = txRes.data ?? []
  const completed = purchases.filter(p => p.status === 'completed' || p.status === 'success' || !p.status)
  const totalOCSpent = completed.reduce((s, p) => s + (p.amount_paid ?? 0) * (p.quantity ?? 1), 0)

  // Sales per item
  const salesMap: Record<string, { count: number; totalOC: number }> = {}
  completed.forEach(p => {
    const k = p.item_name ?? 'Unknown'
    if (!salesMap[k]) salesMap[k] = { count: 0, totalOC: 0 }
    salesMap[k].count += p.quantity ?? 1
    salesMap[k].totalOC += (p.amount_paid ?? 0) * (p.quantity ?? 1)
  })
  const topSellers = Object.entries(salesMap).sort((a, b) => b[1].count - a[1].count).slice(0, 10)

  // Category breakdown
  const catMap: Record<string, number> = {}
  completed.forEach(p => { const k = p.category ?? 'other'; catMap[k] = (catMap[k] ?? 0) + 1 })
  const catColors: Record<string, string> = {
    caps: '#00D4FF', victory_points: '#B8860B', character_points: '#8844CC',
    currency: '#B8860B', sidekick: '#00AA44', team_up: '#CC0000', contact: '#888', portrait: '#00D4FF',
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>PETE'S PAWN SHOP</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        {itemsRes.error ? `Omniverse DB: ${itemsRes.error.message}` : `In-game currency items · ${items.length} in catalog · ${completed.length} transactions`}
      </p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'CATALOG ITEMS', value: items.length, color: '#00D4FF' },
          { label: 'ACTIVE ITEMS', value: items.filter(i => i.active).length, color: '#00AA44' },
          { label: 'TRANSACTIONS', value: completed.length, color: '#B8860B' },
          { label: 'TOTAL OC SPENT', value: totalOCSpent.toLocaleString(), color: '#B8860B' },
          { label: 'AVG ORDER (OC)', value: completed.length > 0 ? Math.round(totalOCSpent / completed.length) : 0, color: '#00D4FF' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {itemsRes.error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', borderRadius: '8px', padding: '20px', color: '#CC4444' }}>
          {itemsRes.error.message.includes('JWT') ? 'OMNIVERSE_SERVICE_ROLE_KEY not set — add to .env.local and Vercel.' : itemsRes.error.message}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>

          {/* Top sellers */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>TOP SELLING ITEMS</div>
            {topSellers.length === 0 ? (
              <div style={{ color: '#444', fontSize: '13px' }}>No OC transactions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topSellers.map(([name, stats], i) => {
                  const catalogItem = items.find(it => it.name === name)
                  return (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#333', fontSize: '11px', width: '18px' }}>#{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        {catalogItem && <div style={{ color: '#555', fontSize: '10px' }}>{catalogItem.category}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{stats.count}×</div>
                        <div style={{ color: '#00D4FF', fontSize: '10px' }}>{stats.totalOC} OC</div>
                      </div>
                      <div style={{ width: '40px', height: '4px', background: '#2A2A2A', borderRadius: '2px' }}>
                        <div style={{ height: '100%', background: '#00D4FF', borderRadius: '2px', width: `${(stats.count / (topSellers[0]?.[1].count ?? 1)) * 100}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>SALES BY CATEGORY</div>
            {Object.keys(catMap).length === 0 ? (
              <div style={{ color: '#444', fontSize: '13px' }}>No transactions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                  const pct = Math.round((count / completed.length) * 100)
                  const color = catColors[cat] ?? '#888'
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color, fontSize: '12px' }}>{cat}</span>
                        <span style={{ color: '#888', fontSize: '12px' }}>{count} · {pct}%</span>
                      </div>
                      <div style={{ height: '5px', background: '#2A2A2A', borderRadius: '3px' }}>
                        <div style={{ height: '100%', background: color, borderRadius: '3px', width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* OC Catalog */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>
              OC CATALOG ({items.length})
              <a href="/admin/store" style={{ color: '#444', fontSize: '11px', marginLeft: '10px', textDecoration: 'none', fontFamily: 'IBM Plex Sans, sans-serif' }}>Manage in Store →</a>
            </div>
            {items.length === 0 ? (
              <div style={{ color: '#444', fontSize: '13px' }}>No OC items in store yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                {items.map(item => {
                  const sold = salesMap[item.name]?.count ?? 0
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid #1F1F1F' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ color: '#444', fontSize: '10px' }}>{item.category} · Min T{item.min_tier}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ color: '#00D4FF', fontSize: '12px', fontFamily: 'Bebas Neue, sans-serif' }}>{item.price} OC</div>
                        {sold > 0 && <div style={{ color: '#B8860B', fontSize: '10px' }}>{sold} sold</div>}
                      </div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.active ? '#00AA44' : '#333', flexShrink: 0 }} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent OC transactions */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>RECENT TRANSACTIONS</div>
            {purchases.slice(0, 20).length === 0 ? (
              <div style={{ color: '#444', fontSize: '13px' }}>No transactions yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ color: '#444', fontSize: '10px', letterSpacing: '0.1em', borderBottom: '1px solid #2A2A2A', textAlign: 'left' }}>
                      <th style={{ padding: '4px 6px' }}>ITEM</th>
                      <th style={{ padding: '4px 6px' }}>OC</th>
                      <th style={{ padding: '4px 6px' }}>QTY</th>
                      <th style={{ padding: '4px 6px' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.slice(0, 20).map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1A1A1A' }}>
                        <td style={{ padding: '5px 6px', color: 'white' }}>{p.item_name}</td>
                        <td style={{ padding: '5px 6px', color: '#00D4FF', fontFamily: 'Bebas Neue, sans-serif' }}>{(p.amount_paid ?? 0) * (p.quantity ?? 1)}</td>
                        <td style={{ padding: '5px 6px', color: '#888' }}>{p.quantity ?? 1}</td>
                        <td style={{ padding: '5px 6px', color: '#444' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
