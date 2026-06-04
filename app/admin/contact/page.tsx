/**
 * /admin/contact — Website contact message inbox.
 * Server Component → 1775gaming project.
 *
 * contact_messages columns:
 *   id, name, email, subject, message, read, created_at
 */
import { createClient } from '@supabase/supabase-js'
import ContactClient from './ContactClient'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function ContactPage() {
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  const messages = data ?? []
  const unread = messages.filter(m => !m.read).length

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        CONTACT INBOX
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>
        {error ? `Error: ${error.message}` : `${messages.length} messages · ${unread} unread`}
      </p>

      {error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', borderRadius: '8px', padding: '20px', color: '#CC4444' }}>{error.message}</div>
      ) : (
        <ContactClient initialData={messages} />
      )}
    </div>
  )
}
