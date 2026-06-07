/**
 * /admin/auction — Notheby's: luxury catalog management + analytics + sales.
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import AuctionClient from './AuctionClient'

export default async function AuctionPage() {
  const [luxItemsRes, luxPurchRes, auctionRes, salesRes] = await Promise.all([
    omniverseAdmin.from('nothebys_items').select('*').order('sort_order'),
    omniverseAdmin.from('nothebys_purchases').select('*').order('purchased_at', { ascending: false }).limit(200),
    omniverseAdmin.from('auction_listings').select('*').order('created_at', { ascending: false }).limit(200),
    omniverseAdmin.from('item_sales').select('*').eq('item_type', 'nothebys').order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        NOTHEBY'S
      </h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        Luxury catalog · Player auction · Promotional sales
      </p>
      <AuctionClient
        initialItems={luxItemsRes.data ?? []}
        initialPurchases={luxPurchRes.data ?? []}
        initialAuctions={auctionRes.data ?? []}
        initialSales={salesRes.data ?? []}
      />
    </div>
  )
}
