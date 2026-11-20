/**
 * /account — the 1775 player account, "Your Games" library, and the tiered membership.
 *
 * Non-members see the plan picker (Basic / All-Access, monthly/annual). Basic members pick their 3
 * games (once / 30 days). Access per game comes from my_access() (owned / all_access / selected /
 * premium_sub). Dynamic, session-gated, reads the WEBSITE Supabase project.
 */
export const dynamic = 'force-dynamic'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { PLANS } from '@/lib/billing-plans'
import GamePicker from './GamePicker'

type Game = {
  id: string
  slug: string
  name: string
  tagline: string | null
  platforms: string[] | null
  status: string
  tier: 'basic' | 'premium'
  cover_url: string | null
  play_url: string | null
  store_url_ios: string | null
  store_url_android: string | null
}
type Membership = { status: string; tier: string | null; current_period_end: string | null; selections_updated_at: string | null }
type Perk = { key: string; name: string; description: string | null }
type Access = { game_id: string; accessible: boolean; reason: string }

const DAY = 86_400_000

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ membership?: string; select?: string; msg?: string }>
}) {
  const sp = await searchParams
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/account/login')

  const [profileRes, gamesRes, memRes, perksRes, accessRes, selRes] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    supabase.from('games').select('*').order('sort'),
    supabase.from('memberships').select('status, tier, current_period_end, selections_updated_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('perks').select('key, name, description').order('name'),
    supabase.rpc('my_access'),
    supabase.from('membership_selections').select('game_id'),
  ])

  const name = (profileRes.data?.display_name as string | undefined) || user.email?.split('@')[0] || 'Commander'
  const games = (gamesRes.data ?? []) as Game[]
  const membership = memRes.data as Membership | null
  const perks = (perksRes.data ?? []) as Perk[]
  const access = new Map(((accessRes.data ?? []) as Access[]).map((a) => [a.game_id, a]))
  const selectedIds = ((selRes.data ?? []) as { game_id: string }[]).map((s) => s.game_id)

  const isMember = membership?.status === 'active' || membership?.status === 'trialing'
  const tier = membership?.tier ?? null
  const periodLabel = membership?.current_period_end ? fmtDate(membership.current_period_end) : ''
  const basicGames = games.filter((g) => g.tier === 'basic')
  const selUpdated = membership?.selections_updated_at
  const nextChangeMs = selUpdated ? new Date(selUpdated).getTime() + 30 * DAY : 0
  const canChange = !selUpdated || Date.now() >= nextChangeMs
  const nextChangeLabel = nextChangeMs ? fmtDate(new Date(nextChangeMs).toISOString()) : ''

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#E8E8E8]">
      <header className="border-b border-[#1F1F1F] bg-[#0A0A0A]">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-[0.15em] text-white">
            1775<span className="text-[#CC0000]">.</span>
          </Link>
          <span className="text-sm text-[#7A7A7A] hidden sm:inline">Your account</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-[#B8B8B8]">{name}</span>
            <form action="/account/signout" method="post">
              <button className="text-xs rounded-md border border-[#2A2A2A] px-3 py-1.5 text-[#9A9A9A] hover:bg-[#1A1A1A] transition">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">
        {sp.membership === 'success' && <Banner kind="good">You&apos;re in — welcome to 1775 membership.</Banner>}
        {sp.membership === 'error' && <Banner kind="bad">Something went wrong with membership. Billing may not be set up yet.</Banner>}
        {sp.select === 'success' && <Banner kind="good">Your games are saved.</Banner>}
        {sp.select === 'error' && <Banner kind="bad">{sp.msg || "Couldn't update your games."}</Banner>}

        {/* ---------- membership ---------- */}
        {isMember ? (
          <section className="rounded-xl border border-[#B8860B] bg-[#1C160A] p-5 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[12rem]">
                <div className="font-semibold text-white">
                  1775 Member — {tier === 'all_access' ? 'All-Access' : 'Basic'}
                </div>
                <div className="text-sm text-[#9A9A9A]">
                  {tier === 'all_access'
                    ? `All basic games + perks everywhere${periodLabel ? ` · renews ${periodLabel}` : ''}.`
                    : `Your 3 basic games + perks${periodLabel ? ` · renews ${periodLabel}` : ''}.`}
                </div>
              </div>
              <form action="/api/membership/portal" method="post">
                <button className="text-sm rounded-lg border border-[#B8860B] text-[#E8B84B] font-semibold px-4 py-2 hover:bg-[#241B0A] transition">
                  Manage membership
                </button>
              </form>
            </div>

            {tier === 'basic' && basicGames.length > 0 && (
              <GamePicker
                games={basicGames.map((g) => ({ id: g.id, name: g.name }))}
                selected={selectedIds}
                canChange={canChange}
                nextChange={nextChangeLabel}
              />
            )}

            {perks.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {perks.map((p) => (
                  <li key={p.key} className="flex items-start gap-2 text-sm">
                    <span className="text-[#8AD64F]">✓</span>
                    <span>
                      <span className="text-[#E8E8E8]">{p.name}</span>
                      {p.description && <span className="text-[#7A7A7A]"> — {p.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-1">Join 1775 membership</h2>
            <p className="text-sm text-[#7A7A7A] mb-4">One subscription, perks in every 1775 game. Cancel anytime.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <PlanCard
                title="Basic"
                monthly={PLANS.basic_monthly.price}
                annual={PLANS.basic_annual.price}
                monthlyPlan="basic_monthly"
                annualPlan="basic_annual"
                bullets={['Choose 3 basic games', 'Change your picks monthly', 'Member perks + discounts']}
              />
              <PlanCard
                title="All-Access"
                featured
                monthly={PLANS.allaccess_monthly.price}
                annual={PLANS.allaccess_annual.price}
                monthlyPlan="allaccess_monthly"
                annualPlan="allaccess_annual"
                bullets={['Every basic game', 'Perks in all games', 'Member discounts']}
              />
            </div>
            <p className="text-xs text-[#6A6A6A] mt-3">
              Premium games (OMNIVERSE, Desolation) have their own subscription — members still get perks + discounts inside them.
            </p>
          </section>
        )}

        {/* ---------- library ---------- */}
        <h1 className="text-2xl font-bold tracking-wide text-white mb-1">Your Games</h1>
        <p className="text-sm text-[#7A7A7A] mb-6">Everything you can play across the 1775 ecosystem.</p>

        {games.length === 0 ? (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-8 text-center text-[#9A9A9A]">
            The games catalog is being set up. Check back shortly.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g} access={access.get(g.id)} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Banner({ kind, children }: { kind: 'good' | 'bad'; children: ReactNode }) {
  const c = kind === 'good' ? 'border-[#2A6A3A] bg-[#12210F] text-[#8AD64F]' : 'border-[#6A2A2A] bg-[#210F0F] text-[#e2574a]'
  return <div className={`rounded-xl border ${c} p-4 mb-4 text-sm`}>{children}</div>
}

function PlanCard({
  title,
  monthly,
  annual,
  monthlyPlan,
  annualPlan,
  bullets,
  featured,
}: {
  title: string
  monthly: string
  annual: string
  monthlyPlan: string
  annualPlan: string
  bullets: string[]
  featured?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 ${featured ? 'border-[#B8860B] bg-[#17130A]' : 'border-[#2A2A2A] bg-[#141414]'}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-white text-lg">{title}</h3>
        <span className="text-[#E8B84B] font-semibold">{monthly}</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-[#B8B8B8]">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-[#8AD64F]">✓</span>
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <form action="/api/membership/checkout" method="post" className="flex-1">
          <input type="hidden" name="plan" value={monthlyPlan} />
          <button className="w-full text-sm rounded-lg bg-[#B8860B] text-black font-semibold px-3 py-2 hover:bg-[#d49f14] transition">
            Monthly
          </button>
        </form>
        <form action="/api/membership/checkout" method="post" className="flex-1">
          <input type="hidden" name="plan" value={annualPlan} />
          <button className="w-full text-sm rounded-lg border border-[#B8860B] text-[#E8B84B] font-semibold px-3 py-2 hover:bg-[#241B0A] transition">
            {annual}
          </button>
        </form>
      </div>
    </div>
  )
}

const ACCESS_BADGE: Record<string, { label: string; cls: string }> = {
  owned: { label: 'Owned', cls: 'text-[#8AD64F] border-[#2A6A3A]' },
  all_access: { label: 'All-Access', cls: 'text-[#E8B84B] border-[#B8860B]' },
  selected: { label: 'In your 3', cls: 'text-[#E8B84B] border-[#B8860B]' },
  premium_sub: { label: 'Subscribed', cls: 'text-[#8AD64F] border-[#2A6A3A]' },
}

function GameCard({ game, access }: { game: Game; access?: Access }) {
  const platforms = game.platforms ?? []
  const coming = game.status === 'coming_soon'
  const isWeb = platforms.includes('web')
  const reason = access?.reason ?? 'none'
  const badge = ACCESS_BADGE[reason]

  return (
    <div className="rounded-xl border border-[#242424] bg-[#141414] overflow-hidden flex flex-col">
      <div className="h-28 bg-gradient-to-br from-[#1E1E1E] to-[#0D0D0D] flex items-center justify-center">
        {game.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-bold tracking-widest text-[#333]">{game.name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-white">{game.name}</h3>
          {badge && <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${badge.cls}`}>{badge.label}</span>}
          {game.tier === 'premium' && !badge && (
            <span className="text-[10px] font-bold text-[#c08af0] border border-[#4a2f6a] rounded px-1.5 py-0.5">PREMIUM</span>
          )}
        </div>
        {game.tagline && <p className="text-sm text-[#9A9A9A] flex-1">{game.tagline}</p>}
        <div className="flex gap-1.5 flex-wrap">
          {platforms.map((p) => (
            <span key={p} className="text-[10px] uppercase tracking-wide text-[#8A8A8A] border border-[#2A2A2A] rounded px-1.5 py-0.5">
              {p === 'ios' ? 'iOS' : p}
            </span>
          ))}
          {coming && (
            <span className="text-[10px] uppercase tracking-wide text-[#E8B84B] border border-[#B8860B] rounded px-1.5 py-0.5">Coming soon</span>
          )}
        </div>

        <div className="mt-2 flex gap-2 flex-wrap">
          {coming ? (
            <button disabled className="text-sm rounded-lg bg-[#1E1E1E] text-[#6A6A6A] px-3 py-2 cursor-not-allowed">
              Coming soon
            </button>
          ) : (
            <>
              {isWeb && game.play_url && (
                <a href={game.play_url} className="text-sm rounded-lg bg-[#CC0000] text-white font-semibold px-3 py-2 hover:bg-[#e01010] transition">
                  Play
                </a>
              )}
              {game.store_url_ios && (
                <a href={game.store_url_ios} className="text-sm rounded-lg border border-[#2A2A2A] text-[#E8E8E8] px-3 py-2 hover:bg-[#1A1A1A] transition">
                  App Store
                </a>
              )}
              {game.store_url_android && (
                <a href={game.store_url_android} className="text-sm rounded-lg border border-[#2A2A2A] text-[#E8E8E8] px-3 py-2 hover:bg-[#1A1A1A] transition">
                  Google Play
                </a>
              )}
              {isWeb && !game.play_url && !game.store_url_ios && !game.store_url_android && (
                <span className="text-sm text-[#7A7A7A] px-1 py-2">Link coming soon</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
