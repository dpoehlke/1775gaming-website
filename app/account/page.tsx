/**
 * /account — the 1775 player account + "Your Games" library.
 *
 * Signed-in players see every 1775 game with play (web) / download (mobile) / coming-soon, their
 * entitlements, and their membership status. Reads the WEBSITE Supabase project via the SSR server
 * client. Dynamic (per-request, session-gated) — never statically prerendered.
 */
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type Game = {
  id: string
  slug: string
  name: string
  tagline: string | null
  platforms: string[] | null
  status: string
  cover_url: string | null
  play_url: string | null
  store_url_ios: string | null
  store_url_android: string | null
}
type Entitlement = { game_id: string; source: string }
type Membership = { status: string; tier: string | null; current_period_end: string | null }

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/account/login')

  const [profileRes, gamesRes, entRes, memRes] = await Promise.all([
    supabase.from('profiles').select('display_name, username, avatar_url').eq('id', user.id).maybeSingle(),
    supabase.from('games').select('*').order('sort'),
    supabase.from('entitlements').select('game_id, source'),
    supabase.from('memberships').select('status, tier, current_period_end').eq('user_id', user.id).maybeSingle(),
  ])

  const name =
    (profileRes.data?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Commander'
  const games = (gamesRes.data ?? []) as Game[]
  const owned = new Set(((entRes.data ?? []) as Entitlement[]).map((e) => e.game_id))
  const membership = memRes.data as Membership | null
  const isMember = membership?.status === 'active' || membership?.status === 'trialing'

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#E8E8E8]">
      {/* header */}
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
        {/* membership banner */}
        <section
          className={`rounded-xl border p-4 mb-8 flex items-center gap-4 flex-wrap ${
            isMember ? 'border-[#B8860B] bg-[#1C160A]' : 'border-[#2A2A2A] bg-[#141414]'
          }`}
        >
          <div className="flex-1 min-w-[12rem]">
            <div className="font-semibold text-white">
              {isMember ? `1775 Member — ${membership?.tier ?? 'founder'}` : '1775 Membership'}
            </div>
            <div className="text-sm text-[#9A9A9A]">
              {isMember
                ? 'Your perks are active across every 1775 game.'
                : 'One subscription, perks in every 1775 game. Coming soon.'}
            </div>
          </div>
          {isMember ? (
            <span className="text-xs font-semibold text-[#E8B84B] border border-[#B8860B] rounded-full px-3 py-1">
              ACTIVE
            </span>
          ) : (
            <button
              disabled
              className="text-sm rounded-lg bg-[#2A2A2A] text-[#8A8A8A] font-semibold px-4 py-2 cursor-not-allowed"
              title="Membership billing arrives in the next phase"
            >
              Become a member
            </button>
          )}
        </section>

        <h1 className="text-2xl font-bold tracking-wide text-white mb-1">Your Games</h1>
        <p className="text-sm text-[#7A7A7A] mb-6">Everything you can play across the 1775 ecosystem.</p>

        {games.length === 0 ? (
          <div className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-8 text-center text-[#9A9A9A]">
            The games catalog is being set up. Check back shortly.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g} owned={owned.has(g.id)} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function GameCard({ game, owned }: { game: Game; owned: boolean }) {
  const platforms = game.platforms ?? []
  const coming = game.status === 'coming_soon'
  const isWeb = platforms.includes('web')

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
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{game.name}</h3>
          {owned && (
            <span className="text-[10px] font-bold text-[#8AD64F] border border-[#2A6A3A] rounded px-1.5 py-0.5">
              OWNED
            </span>
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
            <span className="text-[10px] uppercase tracking-wide text-[#E8B84B] border border-[#B8860B] rounded px-1.5 py-0.5">
              Coming soon
            </span>
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
