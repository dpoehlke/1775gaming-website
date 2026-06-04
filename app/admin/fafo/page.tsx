/**
 * /admin/fafo — FAFO Encounter session logs.
 * Server Component.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function FAFOPage() {
  const { data, error } = await supabaseAdmin
    .from('encounter_sessions')
    .select('*')
    .order('encounter_date', { ascending: false })
    .limit(200)

  const sessions = data ?? []
  const wins = sessions.filter(s => s.success).length
  const totalOC = sessions.reduce((s, e) => s + (e.rewards_currency ?? 0), 0)
  const totalCaps = sessions.reduce((s, e) => s + (e.rewards_caps ?? 0), 0)
  const loot = sessions.filter(s => s.rewards_loot_name).length

  const DIFF_COLORS: Record<string, string> = {
    civic: '#888', street: '#00D4FF', villain: '#B8860B', crisis: '#CC0000', alien: '#8844CC',
  }

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>FAFO ENCOUNTERS</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>
        {error ? 'encounter_sessions table not found — create it in Supabase' : `${sessions.length} total patrols across all players`}
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'TOTAL WINS', value: wins, color: '#B8860B' },
          { label: 'TOTAL LOSSES', value: sessions.length - wins, color: '#CC0000' },
          { label: 'WIN RATE', value: sessions.length > 0 ? `${((wins / sessions.length) * 100).toFixed(0)}%` : '—', color: '#00AA44' },
          { label: 'OC AWARDED', value: totalOC.toLocaleString(), color: '#B8860B' },
          { label: 'CAPS AWARDED', value: totalCaps, color: '#00D4FF' },
          { label: 'LOOT DROPPED', value: loot, color: '#8844CC' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${color}`, borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#666', fontSize: '10px', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#444', marginBottom: '8px' }}>TABLE NOT YET CREATED</div>
          <div style={{ color: '#666', fontSize: '13px' }}>Create the <code style={{ color: '#B8860B' }}>encounter_sessions</code> table in Supabase.</div>
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666' }}>No encounter sessions yet.</div>
      ) : (
        <>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: '8px', padding: '8px 12px', color: '#555', fontSize: '10px', letterSpacing: '0.1em', borderBottom: '1px solid #2A2A2A', marginBottom: '4px' }}>
            <span>HERO</span><span>ENCOUNTER</span><span>DIFFICULTY</span><span>OUTCOME</span><span>OC</span><span>LOOT</span><span>DATE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {sessions.map(s => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px', gap: '8px', padding: '9px 12px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${s.success ? '#00AA44' : '#CC0000'}`, borderRadius: '4px', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'white' }}>{s.character_name ?? '—'}</span>
                <span style={{ color: '#C0C0C0' }}>{s.encounter_title ?? '—'}</span>
                <span style={{ color: DIFF_COLORS[s.difficulty_tier] ?? '#888' }}>{s.difficulty_tier ?? '—'}</span>
                <span>
                  {s.is_crit_success && <span style={{ color: '#00AA44', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif' }}>CRIT!</span>}
                  {s.is_crit_fail && <span style={{ color: '#CC0000', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif' }}>FUMBLE</span>}
                  {!s.is_crit_success && !s.is_crit_fail && <span style={{ color: s.success ? '#00AA44' : '#CC0000', fontSize: '10px', fontFamily: 'Bebas Neue, sans-serif' }}>{s.success ? 'WIN' : 'LOSS'}</span>}
                </span>
                <span style={{ color: '#B8860B' }}>{s.rewards_currency ?? 0} OC</span>
                <span style={{ color: '#8844CC' }}>{s.rewards_loot_name ?? '—'}</span>
                <span style={{ color: '#555' }}>{s.encounter_date ? new Date(s.encounter_date).toLocaleDateString() : '—'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
