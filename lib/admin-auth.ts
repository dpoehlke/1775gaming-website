/**
 * Cookie-based SuperAdmin session — no Supabase auth required.
 *
 * Uses Web Crypto (HMAC-SHA256) so this module is safe to import
 * in both Node.js API routes AND Next.js middleware (Edge runtime).
 *
 * Cookie value format: "admin:<timestamp>.<base64url-signature>"
 * The signature covers the payload so the cookie cannot be forged
 * without the ADMIN_SESSION_SECRET env var.
 */

export const ADMIN_COOKIE   = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 8   // 8 hours in seconds

// ── HMAC-SHA256 using Web Crypto (Edge-compatible) ───────────────────────────

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  // base64url — no Buffer (not available in Edge)
  return btoa(Array.from(new Uint8Array(buf), (b) => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// ── Public helpers ────────────────────────────────────────────────────────────

/** Create a signed session token to store in the cookie. */
export async function createSession(secret: string): Promise<string> {
  const payload = `admin:${Date.now()}`
  const sig     = await hmacSign(secret, payload)
  return `${payload}.${sig}`
}

/** Returns true only if the token was signed with the correct secret. */
export async function verifySession(
  token:  string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token || !secret) return false
  const cut     = token.lastIndexOf('.')
  if (cut === -1) return false
  const payload  = token.slice(0, cut)
  const sig      = token.slice(cut + 1)
  const expected = await hmacSign(secret, payload)
  // Constant-time comparison (both strings are base64url of same length)
  return expected === sig
}
