/**
 * /admin/pawnshop — Pete's Pawn Shop: catalog management + analytics + sales.
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import PawnshopClient from './PawnshopClient'

export default async function PawnShopPage() {
  const [itemsRes, txRes, salesRes] = await Promise.all([
    omniverseAdmin
      .from('store_items')
      .select('id, name, description, category, price, price_type, quantity, active, sort_order, icon_url, min_tier, revenuecat_product_id')
      .eq('price_type', 'in_game_currency')
      .order('sort_order'),
    omniverseAdmin
      .from('purchases')
      .select('id, item_name, category, amount_paid, price_type, quantity, status, created_at')
      .eq('price_type', 'in_game_currency')
      .order('created_at', { ascending: false })
      .limit(500),
    omniverseAdmin
      .from('item_sales')
      .select('*')
      .eq('item_type', 'store')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        PETE'S PAWN SHOP
      </h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        In-game currency catalog · Promotional sales
      </p>
      <PawnshopClient
        initialItems={itemsRes.data ?? []}
        initialPurchases={txRes.data ?? []}
        initialSales={salesRes.data ?? []}
        dbError={itemsRes.error?.message}
      />
    </div>
  )
}
