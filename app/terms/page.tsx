import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // re-fetch from Supabase max once per hour

export default async function TermsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('document_type', 'terms')
    .eq('is_active', true)
    .single()

  if (!data) {
    return (
      <main className='max-w-4xl mx-auto px-4 py-12'>
        <p className='text-gray-400'>
          The terms of service are temporarily unavailable. Please email{' '}
          <a href='mailto:legal@1775gaming.com' className='underline'>
            legal@1775gaming.com
          </a>{' '}
          for a copy.
        </p>
      </main>
    )
  }

  return (
    <main className='max-w-4xl mx-auto px-4 py-12'>
      <div className='text-sm text-gray-500 mb-4'>
        Version {data.version} — Effective {data.effective_date}
      </div>
      <div dangerouslySetInnerHTML={{ __html: data.content_html }} />
    </main>
  )
}