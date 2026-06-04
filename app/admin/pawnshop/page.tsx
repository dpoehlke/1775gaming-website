/**
 * /admin/pawnshop — Pete's Pawn Shop analytics.
 * Server Component.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const RARITY_COLORS: Record<string, string> = {
  common: '#888', uncommon: '#00AA44', rare: '#00D4FF', epic: '#8844CC', legendary: '#B8860B',
}

export default async function PawnShopPage() {
  const { data, error } = await supabaseAdmin
    .from('pawn_sales')
    .select('*')
    .order('created_date', { ascending: false })
    .limit(500)

  const sales = data ?? []
  const totalOC = sales.reduce((s, r) => s + (r.oc_received ?? 0), 0)

  // Top items by count
  const itemMap: Record<string, { name: string; rarity: string; count: number; totalOC: number }> = {}
  sales.forEach(s => {
    const k = s.item_name ?? 'Unknown'
    if (!itemMap[k]) itemMap[k] = { name: k, rarity: s.item_rarity ?? 'common', count: 0, totalOC: 0 }
    itemMap[k].count++
    itemMap[k].totalOC += s.oc_received ?? 0
  })
  const topItems = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 10)

  // Rarity breakdown
  const rarityMap: Record<string, { count: number; totalOC: number }> = {}
  sales.forEach(s => {
    const r = s.item_rarity ?? 'common'
    if (!rarityMap[r]) rarityMap[r] = { count: 0, totalOC: 0 }
    rarityMap[r].count++
    rarityMap[r].totalOC += s.oc_received ?? 0
  })

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>PETE'S PAWN SHOP</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        {error ? 'pawn_sales table not found' : 'Item sales analytics & market trends'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'TRANSACTIONS', value: sales.length, color: '#B8860B' },
          { label: 'TOTAL OC PAID', value: totalOC.toLocaleString(), color: '#B8860B' },
          { label: 'UNIQUE ITEMS', value: Object.keys(itemMap).length, color: '#00D4FF' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#666', fontSize: '10px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#444', marginBottom: '8px' }}>TABLE NOT YET CREATED</div>
          <div style={{ color: '#666', fontSize: '13px' }}>Create the <code style={{ color: '#B8860B' }}>pawn_sales</code> table in Supabase.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>

          {/* Most sold items */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>MOST SOLD ITEMS</div>
            {topItems.length === 0 ? <div style={{ color: '#555', fontSize: '13px' }}>No sales yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topItems.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#444', fontSize: '11px', width: '20px', textAlign: 'right' }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <span style={{ color: RARITY_COLORS[item.rarity] ?? '#888', fontSize: '10px' }}>{item.rarity}</span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{item.count}×</div>
                      <div style={{ color: '#B8860B', fontSize: '10px' }}>{item.totalOC} OC</div>
                    </div>
                    {/* Bar */}
                    <div style={{ width: '50px', height: '4px', background: '#2A2A2A', borderRadius: '2px', flexShrink: 0 }}>
                      <div style={{ height: '100%', background: '#B8860B', borderRadius: '2px', width: `${(item.count / (topItems[0]?.count ?? 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rarity breakdown */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>SALES BY RARITY</div>
            {Object.keys(rarityMap).length === 0 ? <div style={{ color: '#555', fontSize: '13px' }}>No sales yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(rarityMap).map(([rarity, stats]) => {
                  const pct = Math.round((stats.count / sales.length) * 100)
                  const color = RARITY_COLORS[rarity] ?? '#888'
                  return (
                    <div key={rarity}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color, fontSize: '12px' }}>{rarity}</span>
                        <span style={{ color: '#888', fontSize: '12px' }}>{stats.count} sold · {stats.totalOC} OC</span>
                      </div>
                      <div style={{ height: '6px', background: '#2A2A2A', borderRadius: '3px' }}>
                        <div style={{ height: '100%', background: color, borderRadius: '3px', width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px', gridColumn: '1 / -1' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>RECENT TRANSACTIONS</div>
            {sales.length === 0 ? <div style={{ color: '#555', fontSize: '13px' }}>No transactions yet.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2A2A2A', color: '#555', textAlign: 'left' }}>
                      {['Item', 'Rarity', 'OC Received', 'Multiplier', 'Chapter', 'Date'].map(h => (
                        <th key={h} style={{ padding: '6px 8px', fontSize: '10px', letterSpacing: '0.1em' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 20).map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #1F1F1F' }}>
                        <td style={{ padding: '7px 8px', color: 'white' }}>{s.item_name}</td>
                        <td style={{ padding: '7px 8px', color: RARITY_COLORS[s.item_rarity] ?? '#888' }}>{s.item_rarity}</td>
                        <td style={{ padding: '7px 8px', color: '#B8860B', fontWeight: 600 }}>{s.oc_received}</td>
                        <td style={{ padding: '7px 8px', color: '#666' }}>{s.market_multiplier ? `×${s.market_multiplier}` : '—'}</td>
                        <td style={{ padding: '7px 8px', color: '#666' }}>{s.campaign_chapter ?? 0}</td>
                        <td style={{ padding: '7px 8px', color: '#555' }}>{s.created_date ? new Date(s.created_date).toLocaleDateString() : '—'}</td>
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
