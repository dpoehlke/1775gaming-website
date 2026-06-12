import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function PrivacyPolicyPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('document_type', 'privacy-policy')
    .eq('is_active', true)
    .single()

  if (!data) {
    return (
      <main className='max-w-4xl mx-auto px-4 py-12'>
        <p className='text-gray-400'>
          The privacy policy is temporarily unavailable. Please email{' '}
          <a href='mailto:privacy@1775gaming.com' className='underline'>
            privacy@1775gaming.com
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