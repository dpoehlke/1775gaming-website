'use client'
/**
 * /admin/world-lore — World building editor.
 * Uses the ACTUAL Omniverse table structure:
 *   world_background (singleton)  — id, content, updated_at, updated_by
 *   world_lore (multi-entry)       — id, title, body, category, is_active
 *   world_npcs (multi-entry)       — id, name, description, demeanor, motivations, alignment, is_active
 *   world_factions (multi-entry)   — id, name, description, alignment, goals, leader, is_active
 *   world_pois (multi-entry)       — id, name, description, persistence_type, location_hint, is_active
 *   absolute_rules (AI rules)      — id, rule_text, priority, is_active
 */
import { useState, useEffect } from 'react'

const OM = (path: string) => `/api/admin/data/${path}?project=omniverse`

const inputStyle: React.CSSProperties = {
  background: '#0D0D0D', border: '1px solid #2A2A2A', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.12em', fontWeight: 700, display: 'block', marginBottom: '4px',
}
const cardStyle: React.CSSProperties = {
  background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '20px', marginBottom: '12px',
}

const TABS = [
  { id: 'background', label: '🌐 Background' },
  { id: 'lore', label: '📖 Lore Entries' },
  { id: 'npcs', label: '👥 NPCs' },
  { id: 'factions', label: '⚔️ Factions' },
  { id: 'pois', label: '📍 POIs' },
  { id: 'rules', label: '🤖 AI Rules' },
]

const NPC_ALIGNMENTS = ['hero', 'villain', 'neutral', 'unknown']
const LORE_CATEGORIES = ['history', 'geography', 'technology', 'culture', 'event', 'legend', 'secret', 'other']
const POI_TYPES = ['permanent', 'temporary', 'hidden', 'legendary']

export default function WorldLorePage() {
  const [tab, setTab] = useState('background')
  const [bg, setBg] = useState<{ id: string; content: string } | null>(null)
  const [bgDraft, setBgDraft] = useState('')
  const [lore, setLore] = useState<any[]>([])
  const [npcs, setNpcs] = useState<any[]>([])
  const [factions, setFactions] = useState<any[]>([])
  const [pois, setPois] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [saved, setSaved] = useState('')

  // Modal state for CRUD
  const [modal, setModal] = useState<{ type: string; item: any; isNew: boolean } | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(OM('world_background?limit=1')).then(r => r.ok ? r.json() : []),
      fetch(OM('world_lore?order=created_at.asc')).then(r => r.ok ? r.json() : []),
      fetch(OM('world_npcs?order=name.asc')).then(r => r.ok ? r.json() : []),
      fetch(OM('world_factions?order=name.asc')).then(r => r.ok ? r.json() : []),
      fetch(OM('world_pois?order=name.asc')).then(r => r.ok ? r.json() : []),
      fetch(OM('absolute_rules?order=priority.asc')).then(r => r.ok ? r.json() : []),
    ]).then(([bgData, loreData, npcData, factionData, poiData, rulesData]) => {
      if (bgData[0]) { setBg(bgData[0]); setBgDraft(bgData[0].content ?? '') }
      setLore(loreData); setNpcs(npcData); setFactions(factionData); setPois(poiData); setRules(rulesData)
      setLoading(false)
    })
  }, [])

  async function saveBg() {
    setSaving('bg')
    if (bg?.id) {
      await fetch(OM(`world_background/${bg.id}`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: bgDraft, updated_at: new Date().toISOString() }) })
    } else {
      const r = await fetch(OM('world_background'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: bgDraft }) })
      if (r.ok) { const d = await r.json(); setBg(d) }
    }
    setSaving(''); setSaved('bg'); setTimeout(() => setSaved(''), 2000)
  }

  async function saveItem(type: string, item: any, isNew: boolean) {
    setSaving(type)
    const { id, created_at, updated_at, ...payload } = item
    const url = isNew ? OM(type) : OM(`${type}/${id}`)
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      const data = await res.json()
      const setter = { world_lore: setLore, world_npcs: setNpcs, world_factions: setFactions, world_pois: setPois, absolute_rules: setRules }[type]
      if (setter) {
        setter((prev: any[]) => isNew ? [...prev, data] : prev.map((p: any) => p.id === id ? data : p))
      }
    }
    setSaving(''); setModal(null)
  }

  async function deleteItem(type: string, id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(OM(`${type}/${id}`), { method: 'DELETE' })
    const setter = { world_lore: setLore, world_npcs: setNpcs, world_factions: setFactions, world_pois: setPois, absolute_rules: setRules }[type]
    if (setter) setter((prev: any[]) => prev.filter((p: any) => p.id !== id))
  }

  if (loading) return <div style={{ color: '#444', padding: '40px', textAlign: 'center' }}>Loading world lore…</div>

  return (
    <div style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: 'white', margin: '0 0 4px' }}>WORLD LORE</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: '13px' }}>Universe lore, NPCs, factions, POIs, and AI GM rules</p>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid #2A2A2A', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #CC0000' : '2px solid transparent',
            color: tab === t.id ? '#CC0000' : '#666', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', marginBottom: '-1px',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── BACKGROUND ── */}
      {tab === 'background' && (
        <div style={cardStyle}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#CC0000', marginBottom: '8px' }}>UNIVERSE BACKGROUND</div>
          <p style={{ color: '#555', fontSize: '12px', marginBottom: '14px' }}>The master narrative context injected into every AI game session.</p>
          <textarea value={bgDraft} onChange={e => setBgDraft(e.target.value)} rows={16} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} placeholder="Describe the world of Omniverse: Ascension…" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={saveBg} disabled={saving === 'bg'} style={{ background: saved === 'bg' ? '#00AA44' : '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 24px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', letterSpacing: '0.1em', cursor: 'pointer' }}>
              {saving === 'bg' ? 'SAVING…' : saved === 'bg' ? '✓ SAVED' : 'SAVE BACKGROUND'}
            </button>
          </div>
        </div>
      )}

      {/* ── LORE ENTRIES ── */}
      {tab === 'lore' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={() => setModal({ type: 'world_lore', item: { title: '', body: '', category: 'history', is_active: true }, isNew: true })} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', cursor: 'pointer' }}>+ NEW LORE ENTRY</button>
          </div>
          {lore.map(entry => (
            <div key={entry.id} style={{ ...cardStyle, borderLeft: `3px solid ${entry.is_active ? '#CC0000' : '#333'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{entry.title}</div>
                  <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>{entry.category}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setModal({ type: 'world_lore', item: { ...entry }, isNew: false })} style={{ background: '#222', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteItem('world_lore', entry.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444420', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
                </div>
              </div>
              <div style={{ color: '#888', fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{entry.body}</div>
            </div>
          ))}
          {lore.length === 0 && <div style={{ color: '#444', padding: '20px', textAlign: 'center' }}>No lore entries yet.</div>}
        </div>
      )}

      {/* ── NPCS ── */}
      {tab === 'npcs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={() => setModal({ type: 'world_npcs', item: { name: '', description: '', demeanor: '', motivations: '', alignment: 'neutral', is_active: true }, isNew: true })} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', cursor: 'pointer' }}>+ NEW NPC</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {npcs.map(npc => (
              <div key={npc.id} style={{ ...cardStyle, marginBottom: 0, borderLeft: `3px solid ${npc.alignment === 'hero' ? '#00AA44' : npc.alignment === 'villain' ? '#CC0000' : '#888'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{npc.name}</div>
                    <div style={{ color: npc.alignment === 'hero' ? '#00AA44' : npc.alignment === 'villain' ? '#CC0000' : '#888', fontSize: '11px' }}>{npc.alignment}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setModal({ type: 'world_npcs', item: { ...npc }, isNew: false })} style={{ background: '#222', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteItem('world_npcs', npc.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444420', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
                  </div>
                </div>
                {npc.description && <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px', whiteSpace: 'pre-wrap' }}>{npc.description}</div>}
                {npc.demeanor && <div style={{ color: '#555', fontSize: '11px' }}>Demeanor: {npc.demeanor}</div>}
                {npc.motivations && <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>Motivations: {npc.motivations}</div>}
              </div>
            ))}
          </div>
          {npcs.length === 0 && <div style={{ color: '#444', padding: '20px', textAlign: 'center' }}>No NPCs yet.</div>}
        </div>
      )}

      {/* ── FACTIONS ── */}
      {tab === 'factions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={() => setModal({ type: 'world_factions', item: { name: '', description: '', alignment: 'neutral', goals: '', leader: '', is_active: true }, isNew: true })} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', cursor: 'pointer' }}>+ NEW FACTION</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {factions.map(f => (
              <div key={f.id} style={{ ...cardStyle, marginBottom: 0, borderLeft: '3px solid #8844CC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{f.name}</div>
                    {f.leader && <div style={{ color: '#555', fontSize: '11px' }}>Leader: {f.leader}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setModal({ type: 'world_factions', item: { ...f }, isNew: false })} style={{ background: '#222', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteItem('world_factions', f.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444420', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
                  </div>
                </div>
                {f.description && <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px', whiteSpace: 'pre-wrap' }}>{f.description}</div>}
                {f.goals && <div style={{ color: '#555', fontSize: '11px', whiteSpace: 'pre-wrap' }}>Goals: {f.goals}</div>}
              </div>
            ))}
          </div>
          {factions.length === 0 && <div style={{ color: '#444', padding: '20px', textAlign: 'center' }}>No factions yet.</div>}
        </div>
      )}

      {/* ── POIS ── */}
      {tab === 'pois' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={() => setModal({ type: 'world_pois', item: { name: '', description: '', persistence_type: 'permanent', location_hint: '', discovery_required: false, is_active: true }, isNew: true })} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', cursor: 'pointer' }}>+ NEW POI</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {pois.map(poi => (
              <div key={poi.id} style={{ ...cardStyle, marginBottom: 0, borderLeft: '3px solid #00D4FF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{poi.name}</div>
                    <div style={{ color: '#00D4FF', fontSize: '11px' }}>{poi.persistence_type} {poi.discovery_required ? '· discovery required' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setModal({ type: 'world_pois', item: { ...poi }, isNew: false })} style={{ background: '#222', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteItem('world_pois', poi.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444420', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
                  </div>
                </div>
                {poi.description && <div style={{ color: '#888', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{poi.description}</div>}
                {poi.location_hint && <div style={{ color: '#555', fontSize: '11px', marginTop: '4px' }}>📍 {poi.location_hint}</div>}
              </div>
            ))}
          </div>
          {pois.length === 0 && <div style={{ color: '#444', padding: '20px', textAlign: 'center' }}>No POIs yet.</div>}
        </div>
      )}

      {/* ── AI RULES ── */}
      {tab === 'rules' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>Absolute rules the AI GM must always follow. Ordered by priority (lower = higher priority).</p>
            <button onClick={() => setModal({ type: 'absolute_rules', item: { rule_text: '', priority: rules.length + 1, is_active: true }, isNew: true })} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 18px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px', cursor: 'pointer' }}>+ ADD RULE</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rules.sort((a, b) => a.priority - b.priority).map(rule => (
              <div key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: '#1A1A1A', border: `1px solid ${rule.is_active ? '#2A2A2A' : '#1A1A1A'}`, borderLeft: `3px solid ${rule.is_active ? '#CC0000' : '#333'}`, borderRadius: '6px' }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#CC0000', flexShrink: 0, width: '28px' }}>#{rule.priority}</div>
                <div style={{ flex: 1, color: rule.is_active ? '#C0C0C0' : '#555', fontSize: '13px', lineHeight: 1.6 }}>{rule.rule_text}</div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button onClick={() => setModal({ type: 'absolute_rules', item: { ...rule }, isNew: false })} style={{ background: '#222', color: '#B8860B', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => deleteItem('absolute_rules', rule.id)} style={{ background: '#1F0D0D', color: '#CC4444', border: '1px solid #CC444420', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
                </div>
              </div>
            ))}
          </div>
          {rules.length === 0 && <div style={{ color: '#444', padding: '20px', textAlign: 'center' }}>No AI rules defined yet.</div>}
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: '8px', width: '100%', maxWidth: '560px', padding: '24px', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: 'white', marginBottom: '18px' }}>
              {modal.isNew ? 'CREATE' : 'EDIT'} {modal.type.replace('world_', '').replace('absolute_rules', 'AI RULE').toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modal.type === 'world_lore' && (<>
                <div><label style={labelStyle}>TITLE</label><input value={modal.item.title ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, title: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>CATEGORY</label>
                  <select value={modal.item.category ?? 'history'} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, category: e.target.value } }))} style={inputStyle}>
                    {LORE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>BODY</label><textarea value={modal.item.body ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, body: e.target.value } }))} rows={8} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={!!modal.item.is_active} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, is_active: e.target.checked } }))} /><span style={{ color: '#C0C0C0', fontSize: '13px' }}>Active</span></label>
              </>)}

              {modal.type === 'world_npcs' && (<>
                <div><label style={labelStyle}>NAME</label><input value={modal.item.name ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, name: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>ALIGNMENT</label>
                  <select value={modal.item.alignment ?? 'neutral'} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, alignment: e.target.value } }))} style={inputStyle}>
                    {NPC_ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>DESCRIPTION</label><textarea value={modal.item.description ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, description: e.target.value } }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div><label style={labelStyle}>DEMEANOR</label><input value={modal.item.demeanor ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, demeanor: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>MOTIVATIONS</label><textarea value={modal.item.motivations ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, motivations: e.target.value } }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              </>)}

              {modal.type === 'world_factions' && (<>
                <div><label style={labelStyle}>NAME</label><input value={modal.item.name ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, name: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>ALIGNMENT</label><input value={modal.item.alignment ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, alignment: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>LEADER</label><input value={modal.item.leader ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, leader: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>DESCRIPTION</label><textarea value={modal.item.description ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, description: e.target.value } }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div><label style={labelStyle}>GOALS</label><textarea value={modal.item.goals ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, goals: e.target.value } }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              </>)}

              {modal.type === 'world_pois' && (<>
                <div><label style={labelStyle}>NAME</label><input value={modal.item.name ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, name: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>PERSISTENCE TYPE</label>
                  <select value={modal.item.persistence_type ?? 'permanent'} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, persistence_type: e.target.value } }))} style={inputStyle}>
                    {POI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>LOCATION HINT</label><input value={modal.item.location_hint ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, location_hint: e.target.value } }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>DESCRIPTION</label><textarea value={modal.item.description ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, description: e.target.value } }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={!!modal.item.discovery_required} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, discovery_required: e.target.checked } }))} /><span style={{ color: '#C0C0C0', fontSize: '13px' }}>Requires discovery</span></label>
              </>)}

              {modal.type === 'absolute_rules' && (<>
                <div><label style={labelStyle}>RULE TEXT</label><textarea value={modal.item.rule_text ?? ''} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, rule_text: e.target.value } }))} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="The AI GM must always…" /></div>
                <div><label style={labelStyle}>PRIORITY (lower = higher priority)</label><input type="number" min={1} value={modal.item.priority ?? 1} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, priority: +e.target.value } }))} style={inputStyle} /></div>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={!!modal.item.is_active} onChange={e => setModal(m => m && ({ ...m, item: { ...m.item, is_active: e.target.checked } }))} /><span style={{ color: '#C0C0C0', fontSize: '13px' }}>Active</span></label>
              </>)}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button onClick={() => setModal(null)} style={{ background: '#222', color: '#888', border: '1px solid #333', borderRadius: '4px', padding: '9px 18px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => saveItem(modal.type, modal.item, modal.isNew)} disabled={saving !== ''} style={{ background: '#CC0000', color: 'white', border: 'none', borderRadius: '4px', padding: '9px 20px', fontFamily: 'Bebas Neue, sans-serif', fontSize: '15px', cursor: 'pointer' }}>
                {saving ? 'SAVING…' : modal.isNew ? 'CREATE' : 'SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
