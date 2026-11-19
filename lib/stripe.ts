/**
 * Stripe server client (web membership billing). Server-side only — never import in a client
 * component. Lazily constructed so that importing this module never throws when STRIPE_SECRET_KEY
 * is unset — that keeps `next build` and unrelated routes working before Stripe is configured.
 */
import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    client = new Stripe(key)
  }
  return client
}
