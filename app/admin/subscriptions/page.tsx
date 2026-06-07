/**
 * /admin/subscriptions — subscription tier overview + sale management.
 * Server Component fetches current sales; SubscriptionsClient handles edits.
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'
import SubscriptionsClient from './SubscriptionsClient'

export default async function SubscriptionsPage() {
  const { data: sales } = await omniverseAdmin
    .from('subscription_sales')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        SUBSCRIPTION TIERS
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>
        Tier configuration, pricing, and promotional sales
      </p>
      <SubscriptionsClient initialSales={sales ?? []} />
    </div>
  )
}
