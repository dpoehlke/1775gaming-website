/**
 * /admin/analytics — charts for beta signups, newsletter, mission routes.
 * Server Component.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function BarChart({ data, color = '#CC0000' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', padding: '0 4px' }}>
      {data.map(({ label, value }) => (
        <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: '10px', color: '#888' }}>{value}</div>
          <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: `${(value / max) * 80}px`, minHeight: value > 0 ? '4px' : '2px', opacity: 0.9 }} />
          <div style={{ fontSize: '9px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40px', textAlign: 'center' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

function PieSegment({ pct, color, offset }: { pct: number; color: string; offset: number }) {
  const r = 45, cx = 50, cy = 50
  const angle = (pct / 100) * 360
  const startAngle = (offset / 100) * 360 - 90
  const endAngle = startAngle + angle
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const large = angle > 180 ? 1 : 0
  if (pct <= 0) return null
  return <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={color} />
}

function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, d) => s + d.value, 0)
  let offset = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100px', flexShrink: 0 }}>
        {slices.map(s => {
          const pct = total > 0 ? (s.value / total) * 100 : 0
          const el = <PieSegment key={s.label} pct={pct} color={s.color} offset={offset} />
          offset += pct
          return el
        })}
        <circle cx="50" cy="50" r="28" fill="#111" />
        <text x="50" y="54" textAnchor="middle" fill="white" fontSize="12" fontFamily="Bebas Neue, sans-serif">{total}</text>
      </svg>
      <div style={{ flex: 1 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#C0C0C0', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px' }}>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', color: '#B8860B', letterSpacing: '0.1em', marginBottom: '16px' }}>{title}</div>
      {children}
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2A2A2A' }}>
      <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ color: 'white', fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px' }}>{value}</span>
        {sub && <div style={{ color: '#666', fontSize: '10px' }}>{sub}</div>}
      </div>
    </div>
  )
}

// Group records by week (last 8 weeks)
function groupByWeek(records: { created_at: string }[]) {
  const weeks: Record<string, number> = {}
  const now = Date.now()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now - i * 7 * 24 * 60 * 60 * 1000)
    const key = `W${Math.ceil(d.getDate() / 7)}/${d.getMonth() + 1}`
    weeks[key] = 0
  }
  records.forEach(r => {
    const d = new Date(r.created_at)
    const age = (now - d.getTime()) / (7 * 24 * 60 * 60 * 1000)
    if (age <= 8) {
      const key = `W${Math.ceil(d.getDate() / 7)}/${d.getMonth() + 1}`
      if (key in weeks) weeks[key]++
    }
  })
  return Object.entries(weeks).map(([label, value]) => ({ label, value }))
}

export default async function AnalyticsPage() {
  const [betaRes, newsRes, routesRes] = await Promise.all([
    supabaseAdmin.from('beta_signups').select('platform, age_range, heard_from, status, created_at'),
    supabaseAdmin.from('newsletter_subscribers').select('source, confirmed, created_at'),
    supabaseAdmin.from('mission_routes').select('type, difficulty, is_active, created_at').limit(500),
  ])

  const betas = betaRes.data ?? []
  const subs = newsRes.data ?? []
  const routes = routesRes.data ?? []

  // Platform breakdown
  const platforms = ['iOS', 'Android', 'Both']
  const platformSlices = platforms.map((p, i) => ({
    label: p,
    value: betas.filter(b => b.platform === p).length,
    color: ['#CC0000', '#00D4FF', '#B8860B'][i],
  }))

  // Beta status breakdown
  const statusSlices = (['pending', 'approved', 'waitlisted', 'rejected'] as const).map((s, i) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: betas.filter(b => b.status === s).length,
    color: ['#B8860B', '#00AA44', '#4488CC', '#CC4444'][i],
  }))

  // Newsletter source breakdown
  const sourceMap: Record<string, number> = {}
  subs.forEach(s => { const k = s.source ?? 'unknown'; sourceMap[k] = (sourceMap[k] ?? 0) + 1 })
  const sourceSlices = Object.entries(sourceMap).map(([label, value], i) => ({
    label, value, color: ['#CC0000', '#B8860B', '#00D4FF', '#00AA44', '#888'][i % 5],
  }))

  // Weekly signups
  const betaWeekly = groupByWeek(betas)
  const newsWeekly = groupByWeek(subs)

  // Heard from
  const heardMap: Record<string, number> = {}
  betas.forEach(b => { const k = b.heard_from ?? 'unknown'; heardMap[k] = (heardMap[k] ?? 0) + 1 })
  const heardSlices = Object.entries(heardMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label, value, color: ['#CC0000', '#B8860B', '#00D4FF', '#00AA44', '#888'][i % 5],
    }))

  // Mission type breakdown
  const missionTypes = ['patrol', 'mission', 'exploration', 'pvp']
  const missionSlices = missionTypes.map((t, i) => ({
    label: t.charAt(0).toUpperCase() + t.slice(1),
    value: routes.filter(r => r.type === t).length,
    color: ['#CC0000', '#B8860B', '#00D4FF', '#00AA44'][i],
  }))

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>
        ANALYTICS
      </h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: '13px' }}>Player acquisition, content, and growth</p>

      {/* Key metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'BETA PIONEERS', value: betas.length, color: '#CC0000' },
          { label: 'APPROVED',       value: betas.filter(b => b.status === 'approved').length, color: '#00AA44' },
          { label: 'NEWSLETTER',     value: subs.length, color: '#B8860B' },
          { label: 'CONFIRMED',      value: subs.filter(s => s.confirmed).length, color: '#00AA44' },
          { label: 'MISSION ROUTES', value: routes.length, color: '#00D4FF' },
          { label: 'ACTIVE ROUTES',  value: routes.filter(r => r.is_active).length, color: '#00AA44' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1A1A1A', border: `1px solid #2A2A2A`, borderTop: `3px solid ${color}`, borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '40px', color, lineHeight: 1 }}>{value}</div>
            <div style={{ color: '#666', fontSize: '10px', letterSpacing: '0.12em', marginTop: '6px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>

        <Card title="BETA SIGNUPS — LAST 8 WEEKS">
          <BarChart data={betaWeekly} color="#CC0000" />
        </Card>

        <Card title="NEWSLETTER GROWTH — LAST 8 WEEKS">
          <BarChart data={newsWeekly} color="#B8860B" />
        </Card>

        <Card title="PLATFORM BREAKDOWN">
          <DonutChart slices={platformSlices} />
        </Card>

        <Card title="APPLICATION STATUS">
          <DonutChart slices={statusSlices} />
        </Card>

        <Card title="HOW THEY HEARD ABOUT US">
          <DonutChart slices={heardSlices.length > 0 ? heardSlices : [{ label: 'No data', value: 0, color: '#333' }]} />
        </Card>

        <Card title="NEWSLETTER SOURCES">
          <DonutChart slices={sourceSlices.length > 0 ? sourceSlices : [{ label: 'No data', value: 0, color: '#333' }]} />
        </Card>

        <Card title="MISSION ROUTE TYPES">
          <DonutChart slices={missionSlices} />
        </Card>

        <Card title="KEY METRICS">
          <div>
            <Metric label="Beta conversion rate" value={`${betas.length > 0 ? ((betas.filter(b => b.status === 'approved').length / betas.length) * 100).toFixed(1) : 0}%`} />
            <Metric label="Newsletter confirm rate" value={`${subs.length > 0 ? ((subs.filter(s => s.confirmed).length / subs.length) * 100).toFixed(1) : 0}%`} />
            <Metric label="Prior beta testers" value={`${betas.length > 0 ? ((betas.filter((b: any) => b.prior_beta).length / betas.length) * 100).toFixed(0) : 0}%`} />
            <Metric label="Active mission routes" value={routes.filter(r => r.is_active).length} sub={`of ${routes.length} total`} />
          </div>
        </Card>

      </div>
    </div>
  )
}
