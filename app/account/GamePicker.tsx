'use client'

/**
 * Basic-tier "pick 3" selector. Enforces at most 3 client-side; the server RPC enforces the real
 * rules (Basic tier, <= 3 basic games, once every 30 days). Posts selected game ids to
 * /api/membership/select.
 */
import { useState } from 'react'

type G = { id: string; name: string }

export default function GamePicker({
  games,
  selected,
  canChange,
  nextChange,
}: {
  games: G[]
  selected: string[]
  canChange: boolean
  nextChange?: string
}) {
  const [picks, setPicks] = useState<string[]>(selected)

  const toggle = (id: string) =>
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]))

  return (
    <form action="/api/membership/select" method="post" className="mt-4">
      <div className="text-sm text-[#9A9A9A] mb-2">
        Your 3 basic games {canChange ? `(${picks.length}/3 chosen)` : `— locked until ${nextChange}`}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {games.map((g) => {
          const on = picks.includes(g.id)
          return (
            <label
              key={g.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                on ? 'border-[#B8860B] bg-[#1C160A]' : 'border-[#2A2A2A] bg-[#0D0D0D]'
              } ${canChange ? 'cursor-pointer' : 'opacity-50'}`}
            >
              <input
                type="checkbox"
                name="game"
                value={g.id}
                checked={on}
                onChange={() => toggle(g.id)}
                disabled={!canChange}
                className="accent-[#B8860B]"
              />
              {g.name}
            </label>
          )
        })}
      </div>
      {canChange && (
        <button className="mt-3 text-sm rounded-lg bg-[#B8860B] text-black font-semibold px-4 py-2 hover:bg-[#d49f14] transition">
          Save my games
        </button>
      )}
    </form>
  )
}
