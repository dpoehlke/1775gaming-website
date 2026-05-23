'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const INPUT_STYLE: React.CSSProperties = {
  width:        '100%',
  background:   '#0D0D0D',
  border:       '1px solid #333',
  borderRadius: '4px',
  color:        'white',
  padding:      '12px',
  fontSize:     '14px',
  outline:      'none',
  boxSizing:    'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display:       'block',
  color:         '#B8860B',
  fontSize:      '11px',
  letterSpacing: '0.15em',
  marginBottom:  '8px',
}

// ── Inner form (needs useSearchParams — must be in Suspense) ──────────────────

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)
  const [lockSecs, setLockSecs] = useState(0)

  // Lockout countdown
  useEffect(() => {
    if (lockSecs <= 0) { if (locked) setLocked(false); return }
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
      const res = await fetch('/api/admin/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })

      if (res.ok) {
        router.push(redirectTo)
        router.refresh()
      } else {
        setAttempts((a) => a + 1)
        setStatus('error')
        setErrorMsg(`Invalid credentials. Attempt ${attempts + 1} of 5.`)
      }
    } catch {
      setAttempts((a) => a + 1)
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
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
        <label style={LABEL_STYLE}>USERNAME</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={onKey}
          autoComplete="username"
          autoFocus
          style={INPUT_STYLE}
        />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={LABEL_STYLE}>PASSWORD</label>
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
          background:   '#2E0D0D',
          border:       '1px solid #CC0000',
          borderRadius: '4px',
          padding:      '12px',
          color:        '#CC0000',
          fontSize:     '13px',
          marginBottom: '20px',
          textAlign:    'center',
        }}>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={status === 'loading' || !username || !password}
        style={{
          width:         '100%',
          background:    status === 'loading' ? '#333' : '#CC0000',
          color:         'white',
          border:        '2px solid #B8860B',
          borderRadius:  '4px',
          padding:       '14px',
          fontFamily:    'Bebas Neue, sans-serif',
          fontSize:      '18px',
          letterSpacing: '0.1em',
          cursor:        status === 'loading' || !username || !password ? 'not-allowed' : 'pointer',
          opacity:       !username || !password ? 0.6 : 1,
        }}
      >
        {status === 'loading' ? 'AUTHENTICATING…' : 'ENTER COMMAND CENTER'}
      </button>
    </>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  return (
    <div style={{
      background:     '#0D0D0D',
      minHeight:      '100vh',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontFamily:     'IBM Plex Sans, sans-serif',
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
