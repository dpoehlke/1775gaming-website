/**
 * /admin/campaigns — campaign management (CRUD).
 * Client Component — fetches from Supabase via admin API.
 */
'use client'
import { useState, useEffect } from 'react'

type Campaign = {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  difficulty: string
  power_level: number
  min_tier: number
  player_count: number
  estimated_chapters: number
  is_origin_campaign: boolean
  world_info?: string
  overarching_story?: string
  ai_instructions?: string
  chapters?: { title: string; synopsis: string }[]
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#888', active: '#00AA44', completed: '#B8860B', archived: '#555',
}

const inputStyle: React.CSSProperties = {
  background: '#0D0D0D', border: '1px solid #333', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px', width: '100%',
  boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', fontWeight: 700,
  display: 'block', marginBottom: '4px',
}

const EMPTY: Omit<Campaign, 'id' | 'created_at' | 'player_count'> = {
  title: '', description: '', status: 'draft', difficulty: 'normal',
  power_level: 6, min_tier: 0, estimated_chapters: 1,
  is_origin_campaign: false, world_info: '', overarching_story: '',
  ai_instructions: '', chapters: [{ title: '', synopsis: '' }],
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Partial<Campaign> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/data/campaigns?project=omniverse&order=created_at.desc')
    if (res.ok) { setCampaigns(await res.json()) } else { setError('campaigns table error') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    const method = isNew ? 'POST' : 'PATCH'
    const url = isNew ? '/api/admin/data/campaigns?project=omniverse' : `/api/admin/data/campaigns/${(editing as Campaign).id}?project=omniverse`
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? `Save failed (${res.status})`)
        return
      }
      setEditing(null)
      await load()
    } catch {
      setError('Network error — could not save campaign')
    } finally {
      setSaving(false)
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this campaign?')) return
    await fetch(`/api/admin/data/campaigns/${id}?project=omniverse`, { method: 'DELETE' })
    await load()
  }

  const openNew = () => { setIsNew(true); setEditing({ ...EMPTY }) }
  const openEdit = (c: Campaign) => { setIsNew(false); setEditing({ ...c }) }
  const upd = (k: string, v: unknown) => setEditing(prev => ({ ...prev, [k]: v }))

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>CAMPAIGN MANAGEMENT</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{error ? error : `${campaigns.length} campaigns`}</p>
        </div>
        <button onClick={openNew} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 20px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', letterSpacing: '0.1em', cursor: 'pointer' }}>
          + NEW CAMPAIGN
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#444', padding: '40px', textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#444', marginBottom: '8px' }}>TABLE NOT YET CREATED</div>
          <div style={{ color: '#666', fontSize: '13px' }}>Create the <code style={{ color: '#B8860B' }}>campaigns</code> table in Supabase.</div>
        </div>
      ) : campaigns.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#666' }}>
          No campaigns yet. Create your first campaign.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {campaigns.map(c => {
            const isExpanded = expandedId === c.id
            return (
              <div key={c.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderLeft: `3px solid ${STATUS_COLORS[c.status] ?? '#555'}`, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px' }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : c.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px', paddingTop: '2px' }}>
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{c.title}</span>
                      {c.is_origin_campaign && <span style={{ background: '#1A1200', color: '#B8860B', border: '1px solid #B8860B40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>ORIGIN</span>}
                      <span style={{ color: STATUS_COLORS[c.status], fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>{c.status.toUpperCase()}</span>
                    </div>
                    <p style={{ color: '#777', fontSize: '12px', margin: 0 }}>{c.description?.slice(0, 100)}{c.description?.length > 100 ? '…' : ''}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {[`PL ${c.power_level}`, c.difficulty, `${c.estimated_chapters || '?'} chapters`, `${c.player_count || 0} players`].map(tag => (
                        <span key={tag} style={{ color: '#666', fontSize: '11px', background: '#222', padding: '1px 6px', borderRadius: '3px' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => openEdit(c)} style={{ background: '#222', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => del(c.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444430', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>Del</button>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #2A2A2A', padding: '14px 20px', background: '#111' }}>
                    {c.world_info && <div style={{ marginBottom: '10px' }}><div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>WORLD INFO</div><div style={{ color: '#C0C0C0', fontSize: '12px', lineHeight: 1.6 }}>{c.world_info}</div></div>}
                    {c.overarching_story && <div style={{ marginBottom: '10px' }}><div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>OVERARCHING STORY</div><div style={{ color: '#C0C0C0', fontSize: '12px', lineHeight: 1.6 }}>{c.overarching_story}</div></div>}
                    {c.chapters && c.chapters.length > 0 && (
                      <div><div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>CHAPTERS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {c.chapters.map((ch, i) => (
                          <div key={i} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '8px 12px' }}>
                            <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>Ch. {i + 1}: {ch.title || 'Untitled'}</div>
                            {ch.synopsis && <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>{ch.synopsis}</div>}
                          </div>
                        ))}
                      </div></div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Edit/Create modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: 'white', marginBottom: '20px' }}>
              {isNew ? 'CREATE CAMPAIGN' : 'EDIT CAMPAIGN'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>TITLE</label><input value={editing.title ?? ''} onChange={e => upd('title', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>STATUS</label>
                <select value={editing.status ?? 'draft'} onChange={e => upd('status', e.target.value)} style={inputStyle}>
                  <option value="draft">Draft</option><option value="active">Active</option>
                  <option value="completed">Completed</option><option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>DESCRIPTION</label><textarea value={editing.description ?? ''} onChange={e => upd('description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><label style={labelStyle}>POWER LEVEL</label><input type="number" value={editing.power_level ?? 6} onChange={e => upd('power_level', +e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>DIFFICULTY</label>
                <select value={editing.difficulty ?? 'normal'} onChange={e => upd('difficulty', e.target.value)} style={inputStyle}>
                  <option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option><option value="legendary">Legendary</option>
                </select>
              </div>
              <div><label style={labelStyle}>MIN TIER</label><input type="number" min={0} max={4} value={editing.min_tier ?? 0} onChange={e => upd('min_tier', +e.target.value)} style={inputStyle} /></div>
            </div>

            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>WORLD INFO (AI CONTEXT)</label><textarea value={editing.world_info ?? ''} onChange={e => upd('world_info', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>OVERARCHING STORY</label><textarea value={editing.overarching_story ?? ''} onChange={e => upd('overarching_story', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>AI GM INSTRUCTIONS</label><textarea value={editing.ai_instructions ?? ''} onChange={e => upd('ai_instructions', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Special instructions for the AI game master..." /></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px', background: '#111', borderRadius: '6px', border: '1px solid #B8860B30' }}>
              <input type="checkbox" id="origin" checked={!!editing.is_origin_campaign} onChange={e => upd('is_origin_campaign', e.target.checked)} />
              <label htmlFor="origin" style={{ color: '#C0C0C0', fontSize: '13px', cursor: 'pointer' }}>
                <strong style={{ color: '#B8860B' }}>Origin Campaign</strong> — All characters must complete this before others unlock
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(null)} style={{ background: '#222', color: '#888', border: '1px solid #333', borderRadius: '4px', padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 24px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', letterSpacing: '0.1em', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'SAVING…' : isNew ? 'CREATE' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
