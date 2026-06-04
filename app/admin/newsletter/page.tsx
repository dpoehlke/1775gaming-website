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
    <div style={{ background: '#0D0D0D', minHeight: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        background: '#1A1A1A', borderBottom: '2px solid #B8860B',
        padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/admin" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>← Command Center</a>
          <span style={{ color: '#333' }}>|</span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#B8860B', letterSpacing: '0.1em' }}>
            NEWSLETTER
          </span>
        </div>
        <a href="/admin/signout" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Sign out</a>
      </div>

      <div style={{ padding: '40px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', color: 'white', margin: '0 0 8px' }}>
          NEWSLETTER SUBSCRIBERS
        </h1>
        <p style={{ color: '#C0C0C0', margin: '0 0 32px' }}>
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
    </div>
  )
}
