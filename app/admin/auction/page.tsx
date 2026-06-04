/**
 * /admin/auction — Notheby's Auction House analytics.
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

export default async function AuctionPage() {
  const { data, error } = await supabaseAdmin
    .from('auction_listings')
    .select('*')
    .order('created_date', { ascending: false })
    .limit(300)

  const listings = data ?? []
  const active = listings.filter(l => l.status === 'active')
  const sold = listings.filter(l => l.status === 'sold')
  const cancelled = listings.filter(l => l.status === 'cancelled')
  const totalVolume = sold.reduce((s, l) => s + (l.asking_price ?? 0), 0)

  // Top sellers
  const sellerMap: Record<string, number> = {}
  sold.forEach(l => {
    const k = l.seller_name ?? l.seller_id ?? 'Unknown'
    sellerMap[k] = (sellerMap[k] ?? 0) + (l.asking_price ?? 0)
  })
  const topSellers = Object.entries(sellerMap).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Most sold items
  const itemMap: Record<string, number> = {}
  sold.forEach(l => { const k = l.item_name ?? 'Unknown'; itemMap[k] = (itemMap[k] ?? 0) + 1 })
  const topItems = Object.entries(itemMap).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>NOTHEBY'S AUCTION</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        {error ? 'auction_listings table not found' : 'Auction house market data and transaction overview'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'ACTIVE LISTINGS', value: active.length, color: '#00AA44' },
          { label: 'ITEMS SOLD', value: sold.length, color: '#B8860B' },
          { label: 'TOTAL VOLUME (OC)', value: totalVolume.toLocaleString(), color: '#B8860B' },
          { label: 'CANCELLED', value: cancelled.length, color: '#CC0000' },
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
          <div style={{ color: '#666', fontSize: '13px' }}>Create the <code style={{ color: '#B8860B' }}>auction_listings</code> table in Supabase.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>

          {/* Top sellers */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>TOP SELLERS BY REVENUE</div>
            {topSellers.length === 0 ? <div style={{ color: '#555', fontSize: '13px' }}>No sales yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topSellers.map(([name, total], i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#444', fontSize: '11px', width: '18px' }}>#{i + 1}</span>
                    <span style={{ flex: 1, color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <span style={{ color: '#B8860B', fontSize: '12px', fontWeight: 600 }}>{total} OC</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most sold items */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>MOST SOLD ITEMS</div>
            {topItems.length === 0 ? <div style={{ color: '#555', fontSize: '13px' }}>No sales yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topItems.map(([name, count], i) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#444', fontSize: '11px', width: '18px' }}>#{i + 1}</span>
                    <span style={{ flex: 1, color: 'white', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <span style={{ color: '#888', fontSize: '12px' }}>{count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent sales */}
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px', gridColumn: '1 / -1' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', marginBottom: '16px' }}>RECENT SALES</div>
            {sold.length === 0 ? <div style={{ color: '#555', fontSize: '13px' }}>No completed sales yet.</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                {[...sold].sort((a, b) => new Date(b.sold_at ?? b.updated_date ?? 0).getTime() - new Date(a.sold_at ?? a.updated_date ?? 0).getTime()).slice(0, 20).map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1F1F1F' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.item_name}</div>
                      <div style={{ color: '#666', fontSize: '10px' }}>{l.seller_name} → {l.buyer_name}</div>
                    </div>
                    <span style={{ color: RARITY_COLORS[l.item_rarity] ?? '#888', fontSize: '10px' }}>{l.item_rarity}</span>
                    <span style={{ color: '#B8860B', fontWeight: 600, fontSize: '12px' }}>{l.asking_price} OC</span>
                    <span style={{ color: '#555', fontSize: '11px' }}>{l.sold_at ? new Date(l.sold_at).toLocaleDateString() : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
