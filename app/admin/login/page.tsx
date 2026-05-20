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
      provider: 'google',
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
          background:     status === 'loading' ? '#222' : '#fff',
          color:          '#1A1A1A',
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
        {/* Google "G" logo */}
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        {status === 'loading' ? 'Redirecting to Google…' : 'Sign in with Google'}
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
