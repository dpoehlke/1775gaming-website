'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SUPERADMIN_UID = 'a4e1c087-2f83-4f94-9ec6-113121c744a1'

// ── Inner form (needs useSearchParams — must be in Suspense) ──────────────────

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/admin'

  const [status,   setStatus]   = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Already logged in as SuperAdmin? Skip the login page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.id === SUPERADMIN_UID) router.push(redirectTo)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleLogin = async () => {
    setStatus('loading')
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        // Pass the intended destination so the callback can redirect correctly
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg('Could not start Google sign-in. Please try again.')
    }
    // On success the browser navigates away to Google — no further action needed here
  }

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        disabled={status === 'loading'}
        style={{
          width:          '100%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '12px',
          background:     status === 'loading' ? '#222' : '#24292e',
          color:          '#fff',
          border:         '2px solid #B8860B',
          borderRadius:   '4px',
          padding:        '14px 20px',
          fontFamily:     'IBM Plex Sans, sans-serif',
          fontSize:       '15px',
          fontWeight:     600,
          letterSpacing:  '0.02em',
          cursor:         status === 'loading' ? 'not-allowed' : 'pointer',
          opacity:        status === 'loading' ? 0.6 : 1,
          transition:     'opacity 0.2s, background 0.2s',
        }}
      >
        {/* GitHub mark */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        {status === 'loading' ? 'Redirecting to GitHub…' : 'Sign in with GitHub'}
      </button>

      {errorMsg && (
        <div style={{
          marginTop:    '16px',
          background:   '#2E0D0D',
          border:       '1px solid #CC0000',
          borderRadius: '4px',
          padding:      '12px',
          color:        '#CC0000',
          fontSize:     '13px',
          textAlign:    'center',
        }}>
          {errorMsg}
        </div>
      )}

      <p style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '20px', lineHeight: 1.5 }}>
        Only the authorized administrator account<br/>can access this area.
      </p>
    </>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  return (
    <div style={{
      background:      '#0D0D0D',
      minHeight:       '100vh',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      fontFamily:      'IBM Plex Sans, sans-serif',
    }}>
      <div style={{
        background:   '#1A1A1A',
        border:       '1px solid #333',
        borderTop:    '3px solid #CC0000',
        padding:      '48px',
        borderRadius: '8px',
        width:        '100%',
        maxWidth:     '380px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: '#CC0000', letterSpacing: '0.1em' }}>
            1775 GAMING
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', letterSpacing: '0.2em', marginTop: '4px' }}>
            COMMAND CENTER
          </div>
          <div style={{ width: '40px', height: '2px', background: '#CC0000', margin: '16px auto 0' }} />
        </div>

        <Suspense fallback={<div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Loading…</div>}>
          <LoginForm />
        </Suspense>

        <div style={{ textAlign: 'center', marginTop: '28px', color: '#444', fontSize: '11px', letterSpacing: '0.1em' }}>
          RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  )
}
