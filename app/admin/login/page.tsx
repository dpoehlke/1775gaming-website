'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SUPERADMIN_UID = 'a4e1c087-2f83-4f94-9ec6-113121c744a1'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: '#0D0D0D',
  border: '1px solid #333',
  borderRadius: '4px',
  color: 'white',
  padding: '12px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

// ── Inner form (needs useSearchParams — must be in Suspense) ─────────────────

function LoginForm() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const redirectTo    = searchParams.get('redirect') || '/admin'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)
  const [lockSecs, setLockSecs] = useState(0)

  // Redirect immediately if already logged in as SuperAdmin
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.id === SUPERADMIN_UID) router.push(redirectTo)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Lockout countdown
  useEffect(() => {
    if (lockSecs <= 0) {
      if (locked) setLocked(false)
      return
    }
    const t = setTimeout(() => setLockSecs((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [lockSecs, locked])

  const handleLogin = async () => {
    if (locked || status === 'loading') return

    if (attempts >= 5) {
      setLocked(true)
      setLockSecs(300)
      setErrorMsg('Too many attempts. Locked for 5 minutes.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.user?.id !== SUPERADMIN_UID) {
        await supabase.auth.signOut()
        setAttempts((a) => a + 1)
        setStatus('error')
        setErrorMsg(`Access denied. Attempt ${attempts + 1} of 5.`)
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setAttempts((a) => a + 1)
      setStatus('error')
      setErrorMsg(`Authentication failed. Attempt ${attempts + 1} of 5.`)
    }
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleLogin() }

  if (locked) {
    return (
      <div style={{ textAlign: 'center', color: '#CC0000', padding: '20px' }}>
        <div style={{ fontSize: '52px' }}>🔒</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', marginTop: '12px' }}>
          ACCESS LOCKED
        </div>
        <div style={{ color: '#C0C0C0', marginTop: '8px' }}>
          Try again in {Math.floor(lockSecs / 60)}:{String(lockSecs % 60).padStart(2, '0')}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', color: '#B8860B', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKey}
          autoComplete="email"
          style={INPUT_STYLE}
        />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', color: '#B8860B', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          PASSWORD
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKey}
          autoComplete="current-password"
          style={INPUT_STYLE}
        />
      </div>

      {errorMsg && (
        <div style={{
          background: '#2E0D0D', border: '1px solid #CC0000', borderRadius: '4px',
          padding: '12px', color: '#CC0000', fontSize: '13px', marginBottom: '20px', textAlign: 'center',
        }}>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={status === 'loading' || !email || !password}
        style={{
          width: '100%',
          background: status === 'loading' ? '#333' : '#CC0000',
          color: 'white',
          border: '2px solid #B8860B',
          borderRadius: '4px',
          padding: '14px',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '18px',
          letterSpacing: '0.1em',
          cursor: status === 'loading' || !email || !password ? 'not-allowed' : 'pointer',
          opacity: !email || !password ? 0.6 : 1,
        }}
      >
        {status === 'loading' ? 'AUTHENTICATING…' : 'ENTER COMMAND CENTER'}
      </button>
    </>
  )
}

// ── Page shell (Suspense required for useSearchParams in Next.js 14) ─────────

export default function AdminLoginPage() {
  return (
    <div style={{
      background: '#0D0D0D', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'IBM Plex Sans, sans-serif',
    }}>
      <div style={{
        background: '#1A1A1A', border: '1px solid #333', borderTop: '3px solid #CC0000',
        padding: '48px', borderRadius: '8px', width: '100%', maxWidth: '400px',
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

        {/* Form wrapped in Suspense so useSearchParams works */}
        <Suspense fallback={<div style={{ color: '#666', textAlign: 'center' }}>Loading…</div>}>
          <LoginForm />
        </Suspense>

        <div style={{ textAlign: 'center', marginTop: '24px', color: '#444', fontSize: '11px', letterSpacing: '0.1em' }}>
          RESTRICTED ACCESS — AUTHORIZED PERSONNEL ONLY
        </div>
      </div>
    </div>
  )
}
