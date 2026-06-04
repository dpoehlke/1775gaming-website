/**
 * /admin/fafo — FAFO Encounter session logs.
 * Server Component → Omniverse project.
 *
 * encounter_sessions columns:
 *   id, character_id, player_id, difficulty_tier, encounter_narrative,
 *   enemy_dc, roll_result, success, rewards_earned (jsonb), encountered_at
 * characters join: id, hero_name
 */
import { omniverseAdmin } from '@/lib/supabase-omniverse'

const DIFF_COLORS: Record<string, string> = {
  civic: '#888', street: '#00D4FF', villain: '#B8860B', crisis: '#CC0000', alien: '#8844CC',
}

export default async function FAFOPage() {
  const { data, error } = await omniverseAdmin
    .from('encounter_sessions')
    .select('*, characters(hero_name, name)')
    .order('encountered_at', { ascending: false })
    .limit(300)

  const sessions = data ?? []

  // Parse rewards from jsonb field
  const parseRewards = (r: any) => {
    if (!r) return { currency: 0, caps: 0, loot: null }
    if (typeof r === 'object') return { currency: r.currency ?? r.omni_credits ?? 0, caps: r.caps ?? 0, loot: r.loot_name ?? r.item ?? null }
    return { currency: 0, caps: 0, loot: null }
  }

  const wins = sessions.filter(s => s.success).length
  const totalOC = sessions.reduce((s, e) => s + (parseRewards(e.rewards_earned).currency), 0)
  const totalCaps = sessions.reduce((s, e) => s + (parseRewards(e.rewards_earned).caps), 0)
  const lootCount = sessions.filter(s => parseRewards(s.rewards_earned).loot).length
  const critWins = sessions.filter(s => s.success && s.roll_result >= 20).length
  const fumbles = sessions.filter(s => !s.success && s.roll_result <= 1).length

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>FAFO ENCOUNTERS</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        {error ? `Omniverse DB: ${error.message}` : `${sessions.length} total patrols across all players`}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'WINS', value: wins, color: '#00AA44' },
          { label: 'LOSSES', value: sessions.length - wins, color: '#CC0000' },
          { label: 'WIN RATE', value: sessions.length > 0 ? `${((wins / sessions.length) * 100).toFixed(0)}%` : '—', color: '#00D4FF' },
          { label: 'CRITS (roll ≥20)', value: critWins, color: '#B8860B' },
          { label: 'FUMBLES (roll ≤1)', value: fumbles, color: '#CC0000' },
          { label: 'OC AWARDED', value: totalOC.toLocaleString(), color: '#B8860B' },
          { label: 'CAPS AWARDED', value: totalCaps, color: '#00D4FF' },
          { label: 'LOOT DROPPED', value: lootCount, color: '#8844CC' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div style={{ background: '#1F0D0D', border: '1px solid #CC0000', borderRadius: '8px', padding: '20px', color: '#CC4444' }}>
          {error.message.includes('JWT') ? 'OMNIVERSE_SERVICE_ROLE_KEY not set — add it to .env.local and Vercel.' : error.message}
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#555' }}>No encounter sessions yet.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 80px 80px 70px 80px', gap: '6px', padding: '6px 10px', color: '#444', fontSize: '9px', letterSpacing: '0.1em', borderBottom: '1px solid #2A2A2A', marginBottom: '4px' }}>
            <span>HERO</span><span>ENCOUNTER</span><span>DIFFICULTY</span><span>ROLL</span><span>OUTCOME</span><span>OC</span><span>DATE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {sessions.map(s => {
              const r = parseRewards(s.rewards_earned)
              const isCrit = s.success && s.roll_result >= 20
              const isFumble = !s.success && s.roll_result <= 1
              const heroName = (s as any).characters?.hero_name ?? (s as any).characters?.name ?? s.character_id?.slice(0, 8)
              return (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 80px 80px 70px 80px', gap: '6px', padding: '8px 10px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${s.success ? '#00AA44' : '#CC0000'}`, borderRadius: '4px', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{heroName ?? '—'}</span>
                  <span style={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.encounter_narrative}>{s.encounter_narrative ? s.encounter_narrative.slice(0, 60) + '…' : '—'}</span>
                  <span style={{ color: DIFF_COLORS[s.difficulty_tier] ?? '#888' }}>{s.difficulty_tier ?? '—'}</span>
                  <span style={{ color: s.roll_result >= 20 ? '#00AA44' : s.roll_result <= 1 ? '#CC0000' : '#C0C0C0', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px' }}>{s.roll_result ?? '—'}</span>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '11px' }}>
                    {isCrit ? <span style={{ color: '#00AA44' }}>CRIT!</span> :
                     isFumble ? <span style={{ color: '#CC0000' }}>FUMBLE</span> :
                     s.success ? <span style={{ color: '#00AA44' }}>WIN</span> : <span style={{ color: '#CC0000' }}>LOSS</span>}
                  </span>
                  <span style={{ color: '#B8860B', fontSize: '11px' }}>{r.currency > 0 ? `${r.currency} OC` : r.loot ? '🎁' : '—'}</span>
                  <span style={{ color: '#444', fontSize: '11px' }}>{s.encountered_at ? new Date(s.encountered_at).toLocaleDateString() : '—'}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
