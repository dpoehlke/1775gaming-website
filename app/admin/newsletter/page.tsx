/**
 * /admin/newsletter — view and manage newsletter subscribers.
 * Server Component. Auth enforced by middleware.
 */
import { createClient } from '@supabase/supabase-js'
import NewsletterClient from './NewsletterClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function NewsletterPage() {
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const subscribers = data ?? []

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        NEWSLETTER SUBSCRIBERS
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>
        {error ? 'Error loading data — check service role key' : `${subscribers.length} total subscribers`}
      </p>

      {error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', padding: '20px', borderRadius: '8px', color: '#CC4444' }}>
          Supabase error: {error.message}
        </div>
      ) : (
        <NewsletterClient initialData={subscribers} />
      )}
    </div>
  )
}
