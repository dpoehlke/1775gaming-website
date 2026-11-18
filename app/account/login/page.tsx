'use client'

/**
 * /account/login — player sign-in for the 1775 account (Google, Apple, email magic-link).
 * Distinct from /admin/login (staff username+password). On success the Supabase OAuth / magic-link
 * redirect lands on /account/callback, which exchanges the code and sends the player to /account.
 */

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function AccountLoginPage() {
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/account/callback` : undefined

  async function oauth(provider: 'google' | 'apple') {
    setError('')
    setBusy(provider)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) {
      setError(error.message)
      setBusy(null)
    }
  }

  async function magicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError('')
    setBusy('email')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    setBusy(null)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#E8E8E8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold tracking-[0.15em] text-white">
            1775<span className="text-[#CC0000]">.</span>
          </div>
          <p className="mt-2 text-sm text-[#9A9A9A]">Sign in to your 1775 account</p>
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-6 space-y-3">
          <button
            onClick={() => oauth('google')}
            disabled={!!busy}
            className="w-full flex items-center justify-center gap-3 rounded-lg bg-white text-[#1f1f1f] font-semibold py-3 disabled:opacity-50 hover:bg-[#f1f3f4] transition"
          >
            <GoogleGlyph />
            {busy === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <button
            onClick={() => oauth('apple')}
            disabled={!!busy}
            className="w-full flex items-center justify-center gap-3 rounded-lg bg-black text-white font-semibold py-3 border border-[#333] disabled:opacity-50 hover:bg-[#1a1a1a] transition"
          >
            <AppleGlyph />
            {busy === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
          </button>

          <div className="flex items-center gap-3 py-1 text-xs text-[#6A6A6A]">
            <span className="h-px flex-1 bg-[#2A2A2A]" />or<span className="h-px flex-1 bg-[#2A2A2A]" />
          </div>

          {sent ? (
            <div className="rounded-lg border border-[#2A6A3A] bg-[#12210F] text-[#8AD64F] text-sm p-4 text-center">
              Check your email — we sent a sign-in link to <b>{email}</b>.
            </div>
          ) : (
            <form onSubmit={magicLink} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-lg bg-[#0D0D0D] border border-[#2A2A2A] px-3 py-3 text-sm outline-none focus:border-[#CC0000]"
              />
              <button
                type="submit"
                disabled={!!busy}
                className="w-full rounded-lg bg-[#CC0000] text-white font-semibold py-3 disabled:opacity-50 hover:bg-[#e01010] transition"
              >
                {busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </form>
          )}

          {error && <p className="text-sm text-[#e2574a] text-center">{error}</p>}
        </div>

        <p className="mt-6 text-center text-xs text-[#6A6A6A]">
          One 1775 account works across every 1775 Gaming title.
        </p>
      </div>
    </main>
  )
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 384 512" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}
