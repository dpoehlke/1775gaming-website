'use client'
/**
 * /admin/world-lore — World building & AI GM context editor.
 * Stores lore as a singleton row in the `world_lore` table.
 */
import { useState, useEffect } from 'react'

type Lore = {
  id?: string
  universe_overview: string
  history_and_origin: string
  geography: string
  factions: string
  technology_and_magic: string
  tone_and_themes: string
  ai_gm_instructions: string
  key_npcs: { name: string; role: string; description: string }[]
  key_locations: { name: string; region: string; description: string }[]
  lore_tags: string[]
}

const DEFAULTS: Lore = {
  universe_overview: '', history_and_origin: '', geography: '',
  factions: '', technology_and_magic: '', tone_and_themes: '',
  ai_gm_instructions: '', key_npcs: [], key_locations: [], lore_tags: [],
}

const inputStyle: React.CSSProperties = {
  background: '#0D0D0D', border: '1px solid #333', color: 'white',
  padding: '10px 12px', borderRadius: '4px', fontSize: '13px',
  width: '100%', boxSizing: 'border-box', lineHeight: 1.6,
}
const labelStyle: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', fontWeight: 700, display: 'block', marginBottom: '6px',
}
const sectionStyle: React.CSSProperties = {
  background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px', marginBottom: '16px',
}
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#CC0000', letterSpacing: '0.08em', marginBottom: '4px',
}

const TABS = [
  { id: 'universe', label: '🌐 Universe' },
  { id: 'history', label: '📖 History' },
  { id: 'npcs', label: '👥 NPCs' },
  { id: 'locations', label: '🗺️ Locations' },
  { id: 'ai', label: '🤖 AI Instructions' },
]

export default function WorldLorePage() {
  const [lore, setLore] = useState<Lore>(DEFAULTS)
  const [loreId, setLoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('universe')
  const [newNpc, setNewNpc] = useState({ name: '', role: '', description: '' })
  const [newLoc, setNewLoc] = useState({ name: '', region: '', description: '' })
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    fetch('/api/admin/data/world_lore?limit=1').then(r => r.ok ? r.json() : []).then((rows: any[]) => {
      if (rows.length > 0) {
        const r = rows[0]
        setLoreId(r.id)
        setLore({
          universe_overview: r.universe_overview ?? '',
          history_and_origin: r.history_and_origin ?? '',
          geography: r.geography ?? '',
          factions: r.factions ?? '',
          technology_and_magic: r.technology_and_magic ?? '',
          tone_and_themes: r.tone_and_themes ?? '',
          ai_gm_instructions: r.ai_gm_instructions ?? '',
          key_npcs: r.key_npcs ?? [],
          key_locations: r.key_locations ?? [],
          lore_tags: r.lore_tags ?? [],
        })
      }
      setLoading(false)
    })
  }, [])

  async function saveLore() {
    setSaving(true)
    const method = loreId ? 'PATCH' : 'POST'
    const url = loreId ? `/api/admin/data/world_lore/${loreId}` : '/api/admin/data/world_lore'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lore) })
    if (res.ok && !loreId) { const d = await res.json(); if (d.id) setLoreId(d.id) }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const upd = (k: keyof Lore, v: unknown) => setLore(l => ({ ...l, [k]: v }))

  if (loading) return <div style={{ color: '#444', padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>WORLD LORE</h1>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Define the universe that guides the AI Game Master</p>
        </div>
        <button onClick={saveLore} disabled={saving} style={{
          background: saved ? '#00AA44' : '#CC0000', color: 'white', border: 'none',
          borderRadius: '4px', padding: '10px 24px', fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '16px', letterSpacing: '0.1em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE ALL LORE'}
        </button>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #2A2A2A', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? '#CC000020' : 'transparent',
            color: tab === t.id ? '#CC0000' : '#666',
            border: 'none', borderBottom: tab === t.id ? '2px solid #CC0000' : '2px solid transparent',
            padding: '8px 16px', cursor: 'pointer', fontSize: '13px', marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'universe' && (
        <div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>UNIVERSE OVERVIEW</div>
            <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>High-level world description injected into every AI session as top-level context.</p>
            <textarea value={lore.universe_overview} onChange={e => upd('universe_overview', e.target.value)} rows={7} style={{ ...inputStyle, resize: 'vertical' }} placeholder="The world of Omniverse: Ascension is a near-future Earth where..." />
          </div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>TECHNOLOGY & POWER SYSTEMS</div>
            <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>How powers work, technology level, and the rules of the universe.</p>
            <textarea value={lore.technology_and_magic} onChange={e => upd('technology_and_magic', e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Powers manifest through Convergence energy (C-Energy)..." />
          </div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>TONE, THEMES & STYLE</div>
            <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>The narrative voice and thematic direction for the AI.</p>
            <textarea value={lore.tone_and_themes} onChange={e => upd('tone_and_themes', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tone: Cinematic, grounded realism. Themes: Identity, responsibility..." />
          </div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>FACTIONS & POLITICAL LANDSCAPE</div>
            <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>Major organizations the AI should reference in narratives.</p>
            <textarea value={lore.factions} onChange={e => upd('factions', e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="The Global Ascension Authority (GAA): International body regulating metahumans..." />
          </div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>GENRE TAGS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {lore.lore_tags.map(tag => (
                <span key={tag} onClick={() => upd('lore_tags', lore.lore_tags.filter(t => t !== tag))} style={{ background: '#CC000020', color: '#CC0000', border: '1px solid #CC000040', borderRadius: '4px', padding: '3px 10px', fontSize: '12px', cursor: 'pointer' }}>
                  {tag} ✕
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { upd('lore_tags', [...lore.lore_tags, newTag.trim()]); setNewTag('') }}} placeholder="Add tag, press Enter..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => { if (newTag.trim()) { upd('lore_tags', [...lore.lore_tags, newTag.trim()]); setNewTag('') }}} style={{ background: '#333', color: '#C0C0C0', border: '1px solid #444', borderRadius: '4px', padding: '8px 14px', cursor: 'pointer' }}>+</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>HISTORY & ORIGIN EVENTS</div>
            <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>Timeline of major world events for grounding narratives.</p>
            <textarea value={lore.history_and_origin} onChange={e => upd('history_and_origin', e.target.value)} rows={12} style={{ ...inputStyle, resize: 'vertical' }} placeholder="2019 — The Convergence Event: A cosmic anomaly grants 0.3% of Earth's population superhuman abilities..." />
          </div>
          <div style={sectionStyle}>
            <div style={sectionTitle}>GEOGRAPHY & WORLD MAP NOTES</div>
            <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>Key cities and geographic features the AI should reference.</p>
            <textarea value={lore.geography} onChange={e => upd('geography', e.target.value)} rows={7} style={{ ...inputStyle, resize: 'vertical' }} placeholder="New Atlantic: Rebuilt coastal megacity, hub of metahuman activity..." />
          </div>
        </div>
      )}

      {tab === 'npcs' && (
        <div style={sectionStyle}>
          <div style={sectionTitle}>KEY NPCs</div>
          <p style={{ color: '#666', fontSize: '11px', marginBottom: '16px' }}>Named characters the AI may encounter, reference, or portray.</p>
          {lore.key_npcs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {lore.key_npcs.map((npc, i) => (
                <div key={i} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '12px', display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{npc.name}</div>
                    {npc.role && <div style={{ color: '#B8860B', fontSize: '11px', marginTop: '2px' }}>{npc.role}</div>}
                    {npc.description && <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>{npc.description}</div>}
                  </div>
                  <button onClick={() => upd('key_npcs', lore.key_npcs.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#CC4444', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '16px' }}>
            <div style={{ color: '#B8860B', fontSize: '11px', letterSpacing: '0.12em', marginBottom: '12px' }}>ADD NPC</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input value={newNpc.name} onChange={e => setNewNpc(n => ({ ...n, name: e.target.value }))} placeholder="Name" style={inputStyle} />
              <input value={newNpc.role} onChange={e => setNewNpc(n => ({ ...n, role: e.target.value }))} placeholder="Role (e.g. Villain, Mentor)" style={inputStyle} />
            </div>
            <textarea value={newNpc.description} onChange={e => setNewNpc(n => ({ ...n, description: e.target.value }))} rows={2} placeholder="Personality, motivation, appearance..." style={{ ...inputStyle, resize: 'vertical', marginBottom: '10px' }} />
            <button disabled={!newNpc.name} onClick={() => { upd('key_npcs', [...lore.key_npcs, { ...newNpc }]); setNewNpc({ name: '', role: '', description: '' }) }} style={{ background: '#333', color: '#C0C0C0', border: '1px solid #444', borderRadius: '4px', padding: '8px 16px', cursor: newNpc.name ? 'pointer' : 'not-allowed', opacity: newNpc.name ? 1 : 0.5 }}>
              + Add NPC
            </button>
          </div>
        </div>
      )}

      {tab === 'locations' && (
        <div style={sectionStyle}>
          <div style={sectionTitle}>KEY LOCATIONS</div>
          <p style={{ color: '#666', fontSize: '11px', marginBottom: '16px' }}>Named places the AI should describe consistently with rich detail.</p>
          {lore.key_locations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {lore.key_locations.map((loc, i) => (
                <div key={i} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '12px', display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{loc.name}</div>
                    {loc.region && <div style={{ color: '#B8860B', fontSize: '11px', marginTop: '2px' }}>{loc.region}</div>}
                    {loc.description && <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>{loc.description}</div>}
                  </div>
                  <button onClick={() => upd('key_locations', lore.key_locations.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#CC4444', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '16px' }}>
            <div style={{ color: '#B8860B', fontSize: '11px', letterSpacing: '0.12em', marginBottom: '12px' }}>ADD LOCATION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input value={newLoc.name} onChange={e => setNewLoc(l => ({ ...l, name: e.target.value }))} placeholder="Location name" style={inputStyle} />
              <input value={newLoc.region} onChange={e => setNewLoc(l => ({ ...l, region: e.target.value }))} placeholder="Region / City" style={inputStyle} />
            </div>
            <textarea value={newLoc.description} onChange={e => setNewLoc(l => ({ ...l, description: e.target.value }))} rows={2} placeholder="Atmosphere, appearance, notable features..." style={{ ...inputStyle, resize: 'vertical', marginBottom: '10px' }} />
            <button disabled={!newLoc.name} onClick={() => { upd('key_locations', [...lore.key_locations, { ...newLoc }]); setNewLoc({ name: '', region: '', description: '' }) }} style={{ background: '#333', color: '#C0C0C0', border: '1px solid #444', borderRadius: '4px', padding: '8px 16px', cursor: newLoc.name ? 'pointer' : 'not-allowed', opacity: newLoc.name ? 1 : 0.5 }}>
              + Add Location
            </button>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div style={sectionStyle}>
          <div style={sectionTitle}>AI GAME MASTER INSTRUCTIONS</div>
          <p style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>Direct behavioral instructions prepended to the GM system prompt for all sessions. Be specific — tone, vocabulary, what to avoid, how to handle player location data.</p>
          <textarea value={lore.ai_gm_instructions} onChange={e => upd('ai_gm_instructions', e.target.value)} rows={14} style={{ ...inputStyle, resize: 'vertical' }} placeholder="ALWAYS address the player's hero by their hero name, never their real name. If the player has provided a home city, weave regional landmarks into scene descriptions for immersion. Never break the 4th wall..." />
          <div style={{ background: '#CC000010', border: '1px solid #CC000030', borderRadius: '6px', padding: '12px', marginTop: '12px' }}>
            <p style={{ color: '#CC0000', fontSize: '12px', margin: 0 }}>
              <strong>Tip:</strong> These instructions apply globally. Use campaign-level AI Instructions for story-specific overrides.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button onClick={saveLore} disabled={saving} style={{ background: saved ? '#00AA44' : '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '12px 28px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '0.1em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'SAVING…' : saved ? '✓ SAVED' : 'SAVE ALL LORE'}
        </button>
      </div>
    </div>
  )
}
