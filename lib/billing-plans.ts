/**
 * The 1775 membership plans → Stripe price ids (from env) + the membership tier each grants.
 * Prices are display-only here; the real amounts live on the Stripe prices.
 */
export type PlanKey = 'basic_monthly' | 'basic_annual' | 'allaccess_monthly' | 'allaccess_annual'
export type MembershipTier = 'basic' | 'all_access'

export interface Plan {
  key: PlanKey
  tier: MembershipTier
  interval: 'month' | 'year'
  priceEnv: string // env var holding the Stripe price id
  label: string
  price: string // display only
}

export const PLANS: Record<PlanKey, Plan> = {
  basic_monthly: { key: 'basic_monthly', tier: 'basic', interval: 'month', priceEnv: 'STRIPE_PRICE_BASIC_MONTHLY', label: 'Basic', price: '$4.99/mo' },
  basic_annual: { key: 'basic_annual', tier: 'basic', interval: 'year', priceEnv: 'STRIPE_PRICE_BASIC_ANNUAL', label: 'Basic', price: '$49/yr' },
  allaccess_monthly: { key: 'allaccess_monthly', tier: 'all_access', interval: 'month', priceEnv: 'STRIPE_PRICE_ALLACCESS_MONTHLY', label: 'All-Access', price: '$9.99/mo' },
  allaccess_annual: { key: 'allaccess_annual', tier: 'all_access', interval: 'year', priceEnv: 'STRIPE_PRICE_ALLACCESS_ANNUAL', label: 'All-Access', price: '$99/yr' },
}

export function isPlanKey(v: unknown): v is PlanKey {
  return typeof v === 'string' && v in PLANS
}

export function planPriceId(plan: Plan): string | undefined {
  return process.env[plan.priceEnv]
}
