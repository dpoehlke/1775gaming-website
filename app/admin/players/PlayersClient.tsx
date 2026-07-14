'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  RARITY_ORDER, RARITY_COLORS, RARITY_LABELS, rarityRank,
  type ItemFlag,
} from '@/lib/omniverse-loot'

// ── Constants ──────────────────────────────────────────────────────────────────
const TIER_NAMES = ['Free', 'Starter', 'Hero', 'Legend', 'Founder']
const TIER_COLORS = ['#6b7280', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

type InvSort = 'flagged' | 'tier_desc' | 'tier_asc' | 'name' | 'newest'
const INV_SORTS: { value: InvSort; label: string }[] = [
  { value: 'flagged', label: 'Flagged first' },
  { value: 'tier_desc', label: 'Loot tier — highest first' },
  { value: 'tier_asc', label: 'Loot tier — lowest first' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'newest', label: 'Newest first' },
]

// ── Styles ─────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: '#1A1A1A', border: '1px solid #333', color: 'white',
  padding: '8px 12px', borderRadius: '4px', fontSize: '13px',
}
const LABEL: React.CSSProperties = {
  color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
  display: 'block', marginBottom: '4px',
}
const btnBase: React.CSSProperties = {
  border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '11px',
  fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em',
}
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Player = {
  id: string; user_id: string; display_name: string; subscription_tier: number
  caps_remaining: number; caps_daily_limit: number; omni_credits: number
  character_points_bank: number
  victory_points: number; max_characters: number; whitelist_tier: number | null
  whitelist_expires: string | null; is_banned: boolean; ban_reason: string | null
  is_suspended: boolean; suspension_expires_at: string | null; created_at: string
  updated_at: string
}
type InventoryItem = {
  id: string; character_id: string; name: string; type: string; rarity: string
  source: string; quantity: number; equipped: boolean; slot: string
  effects: unknown[]; created_at: string
  /** Server-computed authenticity flags — each carries the reason it tripped. */
  flags: ItemFlag[]
}
type Character = {
  id: string; name: string; hero_name: string; archetype: string
  power_level: number; total_power_points: number
  abilities: Record<string, number>; skills: unknown[]
  advantages: unknown[]; powers: unknown[]; defenses: Record<string, number>
  offense: Record<string, number>; equipment: Record<string, unknown>
  status: string; is_villain: boolean; created_at: string
  inventory: InventoryItem[]
}
type ItemTemplate = {
  id: string; name: string; description: string | null; rarity: string
  slot: string; item_type: string; effects: unknown[]
}

// ── Build Validation ───────────────────────────────────────────────────────────
function validateBuild(c: Character): { issues: string[]; warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []
  const PL = c.power_level

  // PL offense cap: attack bonus + damage bonus ≤ PL×2
  const atk = c.offense?.['attack'] ?? 0
  const dmg = c.offense?.['damage'] ?? 0
  if (atk + dmg > PL * 2) {
    issues.push(`Offense cap violated: attack(${atk}) + damage(${dmg}) = ${atk + dmg} > PL×2 (${PL * 2})`)
  }

  // PL defense cap: defense + toughness ≤ PL×2
  const def = c.defenses?.['dodge'] ?? c.defenses?.['defense'] ?? 0
  const tough = c.defenses?.['toughness'] ?? 0
  if (def + tough > PL * 2) {
    issues.push(`Defense cap violated: dodge(${def}) + toughness(${tough}) = ${def + tough} > PL×2 (${PL * 2})`)
  }

  // Rough point budget estimate
  const abilityPoints = Object.values(c.abilities ?? {}).reduce((s: number, v) => s + (Number(v) > 0 ? Number(v) * 2 : 0), 0)
  const skillPoints = Math.ceil((Array.isArray(c.skills) ? c.skills.length : 0) / 2)
  const advPoints = Array.isArray(c.advantages) ? c.advantages.length : 0
  const roughSpent = abilityPoints + skillPoints + advPoints
  if (roughSpent > c.total_power_points + 20) {
    warnings.push(`Estimated PP spend (~${roughSpent}) exceeds budget (${c.total_power_points}) — manual review recommended`)
  }

  if (PL > 20) issues.push(`Power Level ${PL} is unusually high (max expected: 20)`)
  if (c.total_power_points > PL * 15 + 30) {
    warnings.push(`PP budget (${c.total_power_points}) is high for PL ${PL} — verify legitimacy`)
  }

  return { issues, warnings }
}

function sortInventory(items: InventoryItem[], sort: InvSort): InventoryItem[] {
  const out = [...items]
  const critical = (i: InventoryItem) => i.flags.some(f => f.severity === 'critical')
  switch (sort) {
    case 'tier_desc':
      return out.sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || a.name.localeCompare(b.name))
    case 'tier_asc':
      return out.sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.name.localeCompare(b.name))
    case 'name':
      return out.sort((a, b) => a.name.localeCompare(b.name))
    case 'newest':
      return out.sort((a, b) => b.created_at.localeCompare(a.created_at))
    case 'flagged':
    default:
      // Critical, then warnings, then clean — rarest first inside each band.
      return out.sort((a, b) =>
        Number(critical(b)) - Number(critical(a)) ||
        Number(b.flags.length > 0) - Number(a.flags.length > 0) ||
        rarityRank(b.rarity) - rarityRank(a.rarity),
      )
  }
}

// ── Moderation Modal ───────────────────────────────────────────────────────────
type ModalState =
  | { type: 'suspend'; player: Player }
  | { type: 'ban'; player: Player }
  | { type: 'tier'; player: Player }
  | null

function ActionModal({
  modal, onClose, onDone,
}: { modal: ModalState; onClose: () => void; onDone: (id: string, patch: Partial<Player>) => void }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [hours, setHours] = useState('24')
  const [reason, setReason] = useState('')
  const [tier, setTier] = useState('1')
  const [timedTier, setTimedTier] = useState(false)
  const [tierExpiry, setTierExpiry] = useState('')

  if (!modal) return null

  async function submit() {
    if (!modal) return
    setLoading(true); setErr('')
    try {
      let body: Record<string, string> = {}
      let patch: Partial<Player> = {}

      if (modal.type === 'suspend') {
        body = { action: 'suspend', value: hours, reason }
        const expiry = new Date(Date.now() + parseInt(hours) * 3600000).toISOString()
        patch = { is_suspended: true, suspension_expires_at: expiry }
      } else if (modal.type === 'ban') {
        body = { action: 'ban', reason }
        patch = { is_banned: true, ban_reason: reason }
      } else if (modal.type === 'tier') {
        if (timedTier && tierExpiry) {
          body = { action: 'set_tier_timed', value: `${tier}:${tierExpiry}` }
          patch = { whitelist_tier: parseInt(tier), whitelist_expires: tierExpiry }
        } else {
          body = { action: 'set_tier', value: tier }
          patch = { subscription_tier: parseInt(tier) }
        }
      }

      const res = await fetch(`/api/admin/players/${modal.player.id}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setErr(json.error ?? 'Request failed'); setLoading(false); return }
      onDone(modal.player.id, patch)
      onClose()
    } catch (e) {
      setErr(String(e)); setLoading(false)
    }
  }

  const box: React.CSSProperties = {
    background: '#151515', border: '1px solid #333', borderRadius: '10px',
    padding: '28px', width: '360px', maxWidth: '90vw',
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={box}>
        <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'white', fontSize: '22px', margin: '0 0 16px' }}>
          {modal.type === 'suspend' ? 'SUSPEND PLAYER' : modal.type === 'ban' ? 'BAN PLAYER' : 'UPDATE TIER'}
        </h3>
        <div style={{ color: '#666', fontSize: '12px', marginBottom: '16px', fontFamily: 'monospace' }}>
          {modal.player.display_name} · {modal.player.user_id?.slice(0, 12)}…
        </div>

        {modal.type === 'suspend' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={LABEL}>DURATION (HOURS)</label>
              <input value={hours} onChange={e => setHours(e.target.value)} type="number" min="1" max="8760"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL}>REASON (OPTIONAL)</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button onClick={submit} disabled={loading}
              style={{ ...btnBase, background: '#B8860B', color: 'black', width: '100%', padding: '10px' }}>
              {loading ? 'APPLYING…' : `SUSPEND ${hours}H`}
            </button>
          </>
        )}

        {modal.type === 'ban' && (
          <>
            <div style={{ marginBottom: '12px', background: '#1F0D0D', border: '1px solid #CC000040', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#CC4444' }}>
              Permanent ban. Player will be locked out immediately.
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL}>BAN REASON (REQUIRED)</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button onClick={submit} disabled={loading || !reason.trim()}
              style={{ ...btnBase, background: reason.trim() ? '#CC0000' : '#3A1A1A', color: 'white', width: '100%', padding: '10px' }}>
              {loading ? 'BANNING…' : 'CONFIRM BAN'}
            </button>
          </>
        )}

        {modal.type === 'tier' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={LABEL}>SUBSCRIPTION TIER</label>
              <select value={tier} onChange={e => setTier(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                {[0, 1, 2, 3, 4].map(n => (
                  <option key={n} value={String(n)}>T{n} — {TIER_NAMES[n]}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="timed" checked={timedTier} onChange={e => setTimedTier(e.target.checked)}
                style={{ accentColor: '#B8860B' }} />
              <label htmlFor="timed" style={{ color: '#999', fontSize: '12px', cursor: 'pointer' }}>
                Time-limited (whitelist grant)
              </label>
            </div>
            {timedTier && (
              <div style={{ marginBottom: '12px' }}>
                <label style={LABEL}>EXPIRES AT</label>
                <input type="datetime-local" value={tierExpiry} onChange={e => setTierExpiry(e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
            )}
            <button onClick={submit} disabled={loading || (timedTier && !tierExpiry)}
              style={{ ...btnBase, background: TIER_COLORS[parseInt(tier)] ?? '#888', color: parseInt(tier) === 0 ? 'white' : 'black', width: '100%', padding: '10px' }}>
              {loading ? 'APPLYING…' : timedTier ? `GRANT T${tier} UNTIL ${tierExpiry ? new Date(tierExpiry).toLocaleDateString() : '?'}` : `SET TIER ${tier} (PERMANENT)`}
            </button>
          </>
        )}

        {err && <div style={{ marginTop: '10px', color: '#CC4444', fontSize: '12px' }}>{err}</div>}
        <button onClick={onClose} style={{ ...btnBase, background: 'transparent', color: '#555', width: '100%', marginTop: '10px' }}>
          CANCEL
        </button>
      </div>
    </div>
  )
}

// ── Balance Adjuster (credits / character points) ──────────────────────────────
function BalanceAdjuster({
  playerId, field, label, unit, color, balance, onDone,
}: {
  playerId: string
  field: 'adjust_credits' | 'adjust_character_points'
  label: string
  unit: string
  color: string
  balance: number
  onDone: (patch: Partial<Player>) => void
}) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const magnitude = Math.floor(Math.abs(Number(amount)))
  const valid = Number.isFinite(magnitude) && magnitude > 0

  async function submit(sign: 1 | -1) {
    if (!valid) return
    setLoading(true); setErr(''); setOk('')
    try {
      const res = await fetch(`/api/admin/players/${playerId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: field, value: String(sign * magnitude), reason }),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setErr(json.error ?? 'Failed'); setLoading(false); return }

      const patch: Partial<Player> = field === 'adjust_credits'
        ? { omni_credits: json.after }
        : { character_points_bank: json.after }
      onDone(patch)
      setOk(`${json.before.toLocaleString()} → ${json.after.toLocaleString()}${json.before + sign * magnitude < 0 ? ' (floored at 0)' : ''}`)
      setAmount(''); setReason('')
    } catch (e) { setErr(String(e)) }
    setLoading(false)
  }

  return (
    <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '6px', padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span style={{ ...LABEL, color, marginBottom: 0 }}>{label}</span>
        <span style={{ color, fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', lineHeight: 1 }}>
          {balance.toLocaleString()}
        </span>
        <span style={{ color: '#444', fontSize: '10px' }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        <input
          value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" placeholder="Amount"
          style={{ ...inputStyle, width: '90px', padding: '6px 8px' }}
        />
        <input
          value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (logged)"
          style={{ ...inputStyle, flex: 1, minWidth: 0, padding: '6px 8px' }}
        />
        <button onClick={() => submit(1)} disabled={!valid || loading}
          style={{ ...btnBase, background: valid ? '#0D1A0D' : '#141414', color: valid ? '#00AA44' : '#333', border: `1px solid ${valid ? '#00AA4440' : '#222'}` }}>
          + GIVE
        </button>
        <button onClick={() => submit(-1)} disabled={!valid || loading}
          style={{ ...btnBase, background: valid ? '#2E0D0D' : '#141414', color: valid ? '#CC4444' : '#333', border: `1px solid ${valid ? '#CC444440' : '#222'}` }}>
          − TAKE
        </button>
      </div>
      {loading && <div style={{ color: '#555', fontSize: '11px' }}>Applying…</div>}
      {err && <div style={{ color: '#CC4444', fontSize: '11px' }}>⚠ {err}</div>}
      {ok && <div style={{ color: '#2A6A2A', fontSize: '11px' }}>✓ {ok}</div>}
    </div>
  )
}

// ── Grant Item Modal ───────────────────────────────────────────────────────────
function GrantItemModal({
  playerId, character, onClose, onGranted,
}: {
  playerId: string
  character: Character
  onClose: () => void
  onGranted: (item: InventoryItem) => void
}) {
  const [templates, setTemplates] = useState<ItemTemplate[] | null>(null)
  const [loadErr, setLoadErr] = useState('')
  const [tier, setTier] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ItemTemplate | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/items/templates')
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        if (json.error) { setLoadErr(json.error); return }
        setTemplates(json)
      })
      .catch(e => { if (!cancelled) setLoadErr(String(e)) })
    return () => { cancelled = true }
  }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (templates ?? [])
      .filter(t => tier === 'all' || t.rarity === tier)
      .filter(t => !q || t.name.toLowerCase().includes(q) || t.item_type.toLowerCase().includes(q))
  }, [templates, tier, search])

  async function grant() {
    if (!selected) return
    setSaving(true); setErr('')
    try {
      const res = await fetch(`/api/admin/players/${playerId}/characters/${character.id}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selected.id, quantity: Number(quantity), reason }),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setErr(json.error ?? 'Grant failed'); setSaving(false); return }
      onGranted(json)
      onClose()
    } catch (e) { setErr(String(e)); setSaving(false) }
  }

  const box: React.CSSProperties = {
    background: '#151515', border: '1px solid #333', borderRadius: '10px',
    padding: '24px', width: '620px', maxWidth: '94vw', maxHeight: '86vh',
    display: 'flex', flexDirection: 'column',
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={box}>
        <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'white', fontSize: '22px', margin: '0 0 4px' }}>
          GRANT ITEM
        </h3>
        <div style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>
          To <span style={{ color: '#C0C0C0' }}>{character.hero_name}</span> · granted items are recorded in the audit log
        </div>

        {/* Loot tier + search */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div>
            <label style={LABEL}>LOOT TIER</label>
            <select value={tier} onChange={e => { setTier(e.target.value); setSelected(null) }} style={inputStyle}>
              <option value="all">All tiers</option>
              {RARITY_ORDER.map(r => <option key={r} value={r}>{RARITY_LABELS[r]}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={LABEL}>SEARCH</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Item name or type…"
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Catalog list */}
        <div style={{
          flex: 1, overflowY: 'auto', minHeight: '140px', maxHeight: '300px',
          border: '1px solid #222', borderRadius: '6px', background: '#0E0E0E', marginBottom: '12px',
        }}>
          {loadErr && <div style={{ color: '#CC4444', fontSize: '12px', padding: '12px' }}>⚠ {loadErr}</div>}
          {!templates && !loadErr && <div style={{ color: '#444', fontSize: '12px', padding: '12px' }}>Loading catalog…</div>}
          {templates && visible.length === 0 && (
            <div style={{ color: '#444', fontSize: '12px', padding: '12px' }}>No items match.</div>
          )}
          {visible.map(t => {
            const isSel = selected?.id === t.id
            return (
              <div key={t.id} onClick={() => setSelected(t)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px',
                cursor: 'pointer', borderBottom: '1px solid #161616',
                background: isSel ? '#1A1A2A' : 'transparent',
              }}>
                <span style={{
                  color: RARITY_COLORS[t.rarity] ?? '#888', fontSize: '10px',
                  minWidth: '72px', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {RARITY_LABELS[t.rarity] ?? t.rarity}
                </span>
                <span style={{ color: isSel ? 'white' : '#C0C0C0', fontSize: '13px', flex: 1 }}>{t.name}</span>
                <span style={{ color: '#555', fontSize: '10px' }}>{t.item_type}</span>
                <span style={{ color: '#3A3A3A', fontSize: '10px', minWidth: '60px', textAlign: 'right' }}>{t.slot}</span>
              </div>
            )
          })}
        </div>

        {/* Quantity + reason */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div style={{ width: '90px' }}>
            <label style={LABEL}>QUANTITY</label>
            <input value={quantity} onChange={e => setQuantity(e.target.value)} type="number" min="1" max="999"
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={LABEL}>REASON (LOGGED)</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. compensation for lost campaign drop"
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>

        {err && <div style={{ color: '#CC4444', fontSize: '12px', marginBottom: '8px' }}>⚠ {err}</div>}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={grant} disabled={!selected || saving}
            style={{
              ...btnBase, flex: 1, padding: '10px',
              background: selected ? (RARITY_COLORS[selected.rarity] ?? '#888') : '#222',
              color: selected ? 'black' : '#444',
            }}>
            {saving ? 'GRANTING…' : selected ? `GRANT ${quantity}× ${selected.name.toUpperCase()}` : 'SELECT AN ITEM'}
          </button>
          <button onClick={onClose} style={{ ...btnBase, background: 'transparent', color: '#555', padding: '10px 18px' }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Remove Item Modal ──────────────────────────────────────────────────────────
function RemoveItemModal({
  playerId, characterId, item, onClose, onRemoved,
}: {
  playerId: string
  characterId: string
  item: InventoryItem
  onClose: () => void
  onRemoved: (itemId: string, remaining: number) => void
}) {
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const qty = Math.floor(Number(quantity))
  const valid = Number.isFinite(qty) && qty >= 1 && qty <= item.quantity
  const wholeStack = valid && qty >= item.quantity

  async function remove() {
    if (!valid) return
    setSaving(true); setErr('')
    try {
      const res = await fetch(`/api/admin/players/${playerId}/characters/${characterId}/inventory`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, quantity: qty, reason }),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setErr(json.error ?? 'Removal failed'); setSaving(false); return }
      onRemoved(item.id, json.remaining ?? 0)
      onClose()
    } catch (e) { setErr(String(e)); setSaving(false) }
  }

  const box: React.CSSProperties = {
    background: '#151515', border: '1px solid #333', borderRadius: '10px',
    padding: '24px', width: '380px', maxWidth: '90vw',
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={box}>
        <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'white', fontSize: '22px', margin: '0 0 12px' }}>
          REMOVE ITEM
        </h3>
        <div style={{
          background: '#0E0E0E', border: '1px solid #222', borderRadius: '6px',
          padding: '10px', marginBottom: '14px',
        }}>
          <div style={{ color: RARITY_COLORS[item.rarity] ?? '#888', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {RARITY_LABELS[item.rarity] ?? item.rarity}
          </div>
          <div style={{ color: 'white', fontSize: '14px', marginTop: '2px' }}>{item.name}</div>
          <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>
            {item.type} · source: {item.source} · qty {item.quantity}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={LABEL}>QUANTITY TO REMOVE (MAX {item.quantity})</label>
          <input value={quantity} onChange={e => setQuantity(e.target.value)} type="number" min="1" max={item.quantity}
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          <div style={{ color: '#555', fontSize: '11px', marginTop: '4px' }}>
            {wholeStack ? 'Removes the item from the inventory entirely.' : valid ? `Leaves ${item.quantity - qty} behind.` : 'Enter a quantity between 1 and ' + item.quantity + '.'}
          </div>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={LABEL}>REASON (LOGGED)</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. duped legendary — confirmed exploit"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>

        {err && <div style={{ color: '#CC4444', fontSize: '12px', marginBottom: '8px' }}>⚠ {err}</div>}

        <button onClick={remove} disabled={!valid || saving}
          style={{ ...btnBase, background: valid ? '#CC0000' : '#3A1A1A', color: 'white', width: '100%', padding: '10px' }}>
          {saving ? 'REMOVING…' : wholeStack ? 'REMOVE ITEM' : `REMOVE ${qty}`}
        </button>
        <button onClick={onClose} style={{ ...btnBase, background: 'transparent', color: '#555', width: '100%', marginTop: '10px' }}>
          CANCEL
        </button>
      </div>
    </div>
  )
}

// ── Inventory Row ──────────────────────────────────────────────────────────────
function InventoryRow({
  item, onRemove,
}: { item: InventoryItem; onRemove: () => void }) {
  const [showFlags, setShowFlags] = useState(false)
  const critical = item.flags.some(f => f.severity === 'critical')
  const flagged = item.flags.length > 0
  const accent = critical ? '#CC4444' : flagged ? '#B8860B' : null

  return (
    <div style={{
      background: critical ? '#1F0D0D' : flagged ? '#1A1200' : '#111',
      border: `1px solid ${critical ? '#CC000040' : flagged ? '#B8860B40' : '#1A1A1A'}`,
      borderRadius: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px' }}>
        {flagged && (
          <button
            onClick={() => setShowFlags(v => !v)}
            title="Show why this item is flagged"
            style={{ background: 'none', border: 'none', color: accent!, cursor: 'pointer', fontSize: '11px', padding: 0 }}
          >
            {critical ? '⚠' : '⚡'} {showFlags ? '▾' : '▸'}
          </button>
        )}
        <span style={{
          color: RARITY_COLORS[item.rarity] ?? '#888', fontSize: '10px',
          minWidth: '70px', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {RARITY_LABELS[item.rarity] ?? item.rarity}
        </span>
        <span style={{ color: flagged ? '#CC8888' : '#C0C0C0', fontSize: '12px', flex: 1 }}>{item.name}</span>
        <span style={{ color: '#444', fontSize: '10px', minWidth: '50px' }}>{item.type}</span>
        <span style={{ color: flagged ? '#CC4444' : '#555', fontSize: '10px', minWidth: '66px' }}>
          {item.source || '(no source)'}
        </span>
        <span style={{ color: '#444', fontSize: '10px', minWidth: '28px' }}>
          {item.quantity > 1 ? `×${item.quantity}` : ''}
        </span>
        {flagged && (
          <span style={{
            background: critical ? '#2E0D0D' : '#1A1200', color: accent!,
            border: `1px solid ${accent}40`, borderRadius: '3px', padding: '1px 5px', fontSize: '9px',
          }}>
            {item.flags.length} FLAG{item.flags.length !== 1 ? 'S' : ''}
          </span>
        )}
        <button onClick={onRemove}
          style={{ ...btnBase, background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', padding: '3px 8px', fontSize: '10px' }}>
          REMOVE
        </button>
      </div>

      {/* Why is this flagged? */}
      {flagged && showFlags && (
        <div style={{ borderTop: `1px solid ${accent}30`, padding: '8px 10px 10px 10px', background: '#0A0A0A' }}>
          {item.flags.map(f => (
            <div key={f.code} style={{ marginBottom: '6px' }}>
              <div style={{
                color: f.severity === 'critical' ? '#CC4444' : '#B8860B',
                fontSize: '10px', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase',
              }}>
                {f.severity === 'critical' ? '⚠' : '⚡'} {f.label}
              </div>
              <div style={{ color: '#999', fontSize: '11px', lineHeight: 1.5, marginTop: '2px' }}>{f.reason}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Character Panel ────────────────────────────────────────────────────────────
function CharacterPanel({ playerId }: { playerId: string }) {
  const [chars, setChars] = useState<Character[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [expandedChar, setExpandedChar] = useState<string | null>(null)
  const [invSort, setInvSort] = useState<InvSort>('flagged')
  const [granting, setGranting] = useState<Character | null>(null)
  const [removing, setRemoving] = useState<{ charId: string; item: InventoryItem } | null>(null)

  async function load() {
    setLoading(true); setErr('')
    try {
      const res = await fetch(`/api/admin/players/${playerId}/characters`)
      const json = await res.json()
      if (!res.ok || json.error) { setErr(json.error ?? 'Failed'); setLoading(false); return }
      setChars(json)
    } catch (e) { setErr(String(e)) }
    setLoading(false)
  }

  const addItem = useCallback((charId: string, item: InventoryItem) => {
    setChars(prev => prev?.map(c =>
      c.id === charId ? { ...c, inventory: [item, ...c.inventory] } : c,
    ) ?? prev)
  }, [])

  const patchItem = useCallback((charId: string, itemId: string, remaining: number) => {
    setChars(prev => prev?.map(c => {
      if (c.id !== charId) return c
      const inventory = remaining > 0
        ? c.inventory.map(i => i.id === itemId ? { ...i, quantity: remaining } : i)
        : c.inventory.filter(i => i.id !== itemId)
      return { ...c, inventory }
    }) ?? prev)
  }, [])

  if (!chars && !loading && !err) {
    return (
      <button onClick={load} style={{ ...btnBase, background: '#1A1A2A', color: '#8888CC', border: '1px solid #2A2A44' }}>
        LOAD CHARACTERS
      </button>
    )
  }
  if (loading) return <div style={{ color: '#444', fontSize: '12px', padding: '8px 0' }}>Loading characters…</div>
  if (err) return <div style={{ color: '#CC4444', fontSize: '12px' }}>{err}</div>
  if (!chars?.length) return <div style={{ color: '#444', fontSize: '12px' }}>No characters on this account.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {granting && (
        <GrantItemModal
          playerId={playerId} character={granting}
          onClose={() => setGranting(null)}
          onGranted={item => addItem(granting.id, item)}
        />
      )}
      {removing && (
        <RemoveItemModal
          playerId={playerId} characterId={removing.charId} item={removing.item}
          onClose={() => setRemoving(null)}
          onRemoved={(itemId, remaining) => patchItem(removing.charId, itemId, remaining)}
        />
      )}

      <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '2px' }}>
        {chars.length} CHARACTER{chars.length !== 1 ? 'S' : ''}
      </div>

      {chars.map(c => {
        const validation = validateBuild(c)
        const flaggedItems = c.inventory.filter(i => i.flags.length > 0)
        const criticalItems = c.inventory.filter(i => i.flags.some(f => f.severity === 'critical'))
        const isOpen = expandedChar === c.id
        const hasIssues = validation.issues.length > 0 || criticalItems.length > 0
        const hasWarnings = validation.warnings.length > 0 || flaggedItems.length > 0

        return (
          <div key={c.id} style={{
            background: '#0E0E0E', border: `1px solid ${hasIssues ? '#CC000060' : hasWarnings ? '#B8860B60' : '#1E1E1E'}`,
            borderRadius: '6px', overflow: 'hidden',
          }}>
            <div
              onClick={() => setExpandedChar(isOpen ? null : c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer' }}
            >
              <span style={{ color: '#333', fontSize: '11px' }}>{isOpen ? '▾' : '▸'}</span>
              <div style={{ flex: 1 }}>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{c.hero_name}</span>
                <span style={{ color: '#444', fontSize: '11px', marginLeft: '8px' }}>{c.name}</span>
                {c.is_villain && <span style={{ marginLeft: '6px', color: '#CC4444', fontSize: '10px', border: '1px solid #CC444440', padding: '0 4px', borderRadius: '3px' }}>VILLAIN</span>}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ color: '#666' }}>{c.archetype}</span>
                <span style={{ color: '#555' }}>PL{c.power_level}</span>
                <span style={{ color: '#444' }}>{c.total_power_points}pp</span>
                <span style={{ color: '#444' }}>{c.inventory.length} items</span>
                {hasIssues && <span style={{ background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>⚠ BUILD ISSUE</span>}
                {!hasIssues && hasWarnings && <span style={{ background: '#1A1200', color: '#B8860B', border: '1px solid #B8860B40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>⚡ WARNING</span>}
                {!hasIssues && !hasWarnings && <span style={{ color: '#2A6A2A', fontSize: '10px' }}>✓ OK</span>}
              </div>
            </div>

            {isOpen && (
              <div style={{ borderTop: '1px solid #1A1A1A', padding: '12px 16px', background: '#0A0A0A' }}>
                {/* Build Validation */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>BUILD VALIDATION</div>
                  {validation.issues.length === 0 && validation.warnings.length === 0 && (
                    <div style={{ color: '#2A6A2A', fontSize: '12px' }}>✓ No violations detected</div>
                  )}
                  {validation.issues.map((iss, i) => (
                    <div key={i} style={{ color: '#CC4444', fontSize: '12px', marginBottom: '4px' }}>⚠ {iss}</div>
                  ))}
                  {validation.warnings.map((w, i) => (
                    <div key={i} style={{ color: '#B8860B', fontSize: '12px', marginBottom: '4px' }}>⚡ {w}</div>
                  ))}
                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '6px', marginTop: '10px' }}>
                    {Object.entries(c.abilities ?? {}).map(([k, v]) => (
                      <div key={k} style={{ background: '#141414', borderRadius: '4px', padding: '4px 8px' }}>
                        <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em' }}>{k.toUpperCase()}</div>
                        <div style={{ color: Number(v) > 0 ? '#00D4FF' : '#666', fontSize: '14px', fontFamily: 'Bebas Neue, sans-serif' }}>{Number(v) > 0 ? `+${v}` : v}</div>
                      </div>
                    ))}
                    {Object.entries(c.defenses ?? {}).map(([k, v]) => (
                      <div key={k} style={{ background: '#141414', borderRadius: '4px', padding: '4px 8px' }}>
                        <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em' }}>{k.toUpperCase()}</div>
                        <div style={{ color: '#8888FF', fontSize: '14px', fontFamily: 'Bebas Neue, sans-serif' }}>{v}</div>
                      </div>
                    ))}
                    {Object.entries(c.offense ?? {}).map(([k, v]) => (
                      <div key={k} style={{ background: '#141414', borderRadius: '4px', padding: '4px 8px' }}>
                        <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em' }}>{k.toUpperCase()}</div>
                        <div style={{ color: '#FF8844', fontSize: '14px', fontFamily: 'Bebas Neue, sans-serif' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.15em' }}>
                      INVENTORY — {c.inventory.length} ITEMS
                      {criticalItems.length > 0 && <span style={{ marginLeft: '8px', color: '#CC4444' }}>({criticalItems.length} FLAGGED)</span>}
                      {criticalItems.length === 0 && flaggedItems.length > 0 && <span style={{ marginLeft: '8px', color: '#B8860B' }}>({flaggedItems.length} TO REVIEW)</span>}
                      {flaggedItems.length === 0 && c.inventory.length > 0 && <span style={{ marginLeft: '8px', color: '#2A6A2A' }}>✓ All verified</span>}
                    </div>
                    <div style={{ flex: 1 }} />
                    <select value={invSort} onChange={e => setInvSort(e.target.value as InvSort)}
                      style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px' }}>
                      {INV_SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button onClick={() => setGranting(c)}
                      style={{ ...btnBase, background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4440' }}>
                      + GRANT ITEM
                    </button>
                  </div>

                  {c.inventory.length === 0 && (
                    <div style={{ color: '#333', fontSize: '12px' }}>No items in inventory.</div>
                  )}
                  {c.inventory.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {sortInventory(c.inventory, invSort).map(item => (
                        <InventoryRow
                          key={item.id}
                          item={item}
                          onRemove={() => setRemoving({ charId: c.id, item })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main Client ────────────────────────────────────────────────────────────────
export default function PlayersClient({ initialData }: { initialData: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(initialData)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionErr, setActionErr] = useState<Record<string, string>>({})

  const patchPlayer = useCallback((id: string, patch: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }, [])

  async function quickAction(playerId: string, body: Record<string, string>, patch: Partial<Player>) {
    setActionLoading(playerId); setActionErr(e => ({ ...e, [playerId]: '' }))
    try {
      const res = await fetch(`/api/admin/players/${playerId}/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || json.error) { setActionErr(e => ({ ...e, [playerId]: json.error ?? 'Failed' })); return }
      patchPlayer(playerId, patch)
    } catch (e) { setActionErr(prev => ({ ...prev, [playerId]: String(e) })) }
    setActionLoading(null)
  }

  const filtered = players.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.display_name?.toLowerCase().includes(q) || p.user_id?.toLowerCase().includes(q)
    const matchTier = filterTier === 'all' || String(p.subscription_tier) === filterTier
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'banned' ? p.is_banned :
      filterStatus === 'suspended' ? (p.is_suspended && !p.is_banned) :
      filterStatus === 'whitelisted' ? p.whitelist_tier != null :
      true
    return matchSearch && matchTier && matchStatus
  })

  const tierCounts = [0, 1, 2, 3, 4].map(n => players.filter(p => p.subscription_tier === n).length)
  const bannedCount = players.filter(p => p.is_banned).length
  const suspendedCount = players.filter(p => p.is_suspended && !p.is_banned).length

  return (
    <div>
      <ActionModal modal={modal} onClose={() => setModal(null)} onDone={patchPlayer} />

      {/* Tier summary chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {[0, 1, 2, 3, 4].map(n => (
          <div key={n} onClick={() => setFilterTier(filterTier === String(n) ? 'all' : String(n))} style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A', borderTop: `3px solid ${TIER_COLORS[n]}`,
            borderRadius: '6px', padding: '10px 14px', cursor: 'pointer', minWidth: '80px',
            opacity: filterTier !== 'all' && filterTier !== String(n) ? 0.35 : 1,
          }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: TIER_COLORS[n], lineHeight: 1 }}>{tierCounts[n]}</div>
            <div style={{ color: '#555', fontSize: '9px', letterSpacing: '0.1em', marginTop: '3px' }}>T{n} {TIER_NAMES[n]}</div>
          </div>
        ))}
        {bannedCount > 0 && (
          <div onClick={() => setFilterStatus(filterStatus === 'banned' ? 'all' : 'banned')} style={{
            background: '#1F0D0D', border: '1px solid #CC000040', borderTop: '3px solid #CC0000',
            borderRadius: '6px', padding: '10px 14px', cursor: 'pointer',
            opacity: filterStatus !== 'all' && filterStatus !== 'banned' ? 0.35 : 1,
          }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#CC0000', lineHeight: 1 }}>{bannedCount}</div>
            <div style={{ color: '#CC444480', fontSize: '9px', letterSpacing: '0.1em', marginTop: '3px' }}>BANNED</div>
          </div>
        )}
        {suspendedCount > 0 && (
          <div onClick={() => setFilterStatus(filterStatus === 'suspended' ? 'all' : 'suspended')} style={{
            background: '#1A1200', border: '1px solid #B8860B40', borderTop: '3px solid #B8860B',
            borderRadius: '6px', padding: '10px 14px', cursor: 'pointer',
            opacity: filterStatus !== 'all' && filterStatus !== 'suspended' ? 0.35 : 1,
          }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#B8860B', lineHeight: 1 }}>{suspendedCount}</div>
            <div style={{ color: '#B8860B80', fontSize: '9px', letterSpacing: '0.1em', marginTop: '3px' }}>SUSPENDED</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={LABEL}>SEARCH</label>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Display name or user ID…"
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={LABEL}>TIER</label>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All Tiers</option>
            {[0, 1, 2, 3, 4].map(n => <option key={n} value={String(n)}>T{n} — {TIER_NAMES[n]}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>STATUS</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="all">All</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
            <option value="whitelisted">Whitelisted</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#555' }}>
          {players.length === 0 ? 'No players registered yet.' : 'No players match your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map(p => {
            const tier = p.subscription_tier ?? 0
            const color = TIER_COLORS[Math.min(tier, 4)] ?? '#888'
            const isExpanded = expandedId === p.id
            const isSuspended = p.is_suspended && p.suspension_expires_at ? new Date(p.suspension_expires_at) > new Date() : false
            const isLoading = actionLoading === p.id

            return (
              <div key={p.id} style={{
                background: '#1A1A1A', border: '1px solid #2A2A2A',
                borderLeft: `3px solid ${p.is_banned ? '#CC0000' : isSuspended ? '#B8860B' : color}`,
                borderRadius: '6px', overflow: 'hidden',
              }}>
                {/* Row header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px' }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '13px' }}>
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{p.display_name ?? 'No display name'}</span>
                      {p.is_banned && <span style={{ background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>BANNED</span>}
                      {isSuspended && !p.is_banned && <span style={{ background: '#1A1200', color: '#B8860B', border: '1px solid #B8860B40', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>SUSPENDED</span>}
                      {p.whitelist_tier != null && <span style={{ background: '#0D1A0D', color: '#00AA44', border: '1px solid #00AA4440', borderRadius: '3px', padding: '1px 6px', fontSize: '10px' }}>WL T{p.whitelist_tier}</span>}
                    </div>
                    <div style={{ color: '#444', fontSize: '10px', marginTop: '1px', fontFamily: 'monospace' }}>{p.user_id?.slice(0, 8)}…</div>
                  </div>

                  {/* Currency stats */}
                  <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#00D4FF', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px' }}>{p.caps_remaining ?? 0}/{p.caps_daily_limit ?? 5}</div>
                      <div style={{ color: '#333', fontSize: '9px' }}>CAPS</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#B8860B', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px' }}>{(p.omni_credits ?? 0).toLocaleString()}</div>
                      <div style={{ color: '#333', fontSize: '9px' }}>OC</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f59e0b', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px' }}>{(p.character_points_bank ?? 0).toLocaleString()}</div>
                      <div style={{ color: '#333', fontSize: '9px' }}>CP</div>
                    </div>
                  </div>

                  {/* Quick action buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {!p.is_banned && !isSuspended && (
                      <button onClick={() => setModal({ type: 'suspend', player: p })}
                        style={{ ...btnBase, background: '#1A1200', color: '#B8860B', border: '1px solid #B8860B40' }}>
                        SUSPEND
                      </button>
                    )}
                    {isSuspended && (
                      <button disabled={isLoading}
                        onClick={() => quickAction(p.id, { action: 'unsuspend' }, { is_suspended: false, suspension_expires_at: null })}
                        style={{ ...btnBase, background: '#1A1200', color: '#B8860B', border: '1px solid #B8860B40', opacity: isLoading ? 0.5 : 1 }}>
                        {isLoading ? '…' : 'UNSUSPEND'}
                      </button>
                    )}
                    {!p.is_banned ? (
                      <button onClick={() => setModal({ type: 'ban', player: p })}
                        style={{ ...btnBase, background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440' }}>
                        BAN
                      </button>
                    ) : (
                      <button disabled={isLoading}
                        onClick={() => quickAction(p.id, { action: 'unban' }, { is_banned: false, ban_reason: null })}
                        style={{ ...btnBase, background: '#2E0D0D', color: '#CC4444', border: '1px solid #CC444440', opacity: isLoading ? 0.5 : 1 }}>
                        {isLoading ? '…' : 'UNBAN'}
                      </button>
                    )}
                    <button onClick={() => setModal({ type: 'tier', player: p })}
                      style={{ ...btnBase, background: '#111', color: color, border: `1px solid ${color}40` }}>
                      TIER
                    </button>
                  </div>

                  {/* Tier label */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color, fontSize: '11px', fontFamily: 'Bebas Neue, sans-serif' }}>T{tier}</div>
                    <div style={{ color: '#444', fontSize: '10px' }}>{TIER_NAMES[Math.min(tier, 4)]}</div>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #222', padding: '16px 18px', background: '#111' }}>
                    {actionErr[p.id] && (
                      <div style={{ color: '#CC4444', fontSize: '12px', marginBottom: '12px' }}>⚠ {actionErr[p.id]}</div>
                    )}

                    {/* Balance adjustments */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                      <BalanceAdjuster
                        playerId={p.id} field="adjust_credits" label="OMNI CREDITS" unit="OC" color="#B8860B"
                        balance={p.omni_credits ?? 0}
                        onDone={patch => patchPlayer(p.id, patch)}
                      />
                      <BalanceAdjuster
                        playerId={p.id} field="adjust_character_points" label="CHARACTER POINTS" unit="CP" color="#f59e0b"
                        balance={p.character_points_bank ?? 0}
                        onDone={patch => patchPlayer(p.id, patch)}
                      />
                    </div>

                    {/* Details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                      {[
                        { label: 'VICTORY POINTS', value: (p.victory_points ?? 0).toLocaleString() },
                        { label: 'MAX CHARACTERS', value: p.max_characters === 999 ? '∞' : p.max_characters },
                        { label: 'WHITELIST TIER', value: p.whitelist_tier != null ? `T${p.whitelist_tier}` : 'None' },
                        { label: 'WHITELIST EXPIRES', value: p.whitelist_expires ? new Date(p.whitelist_expires).toLocaleDateString() : 'Never' },
                        { label: 'JOINED', value: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—' },
                        { label: 'LAST ACTIVE', value: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—' },
                        ...(p.is_banned ? [{ label: 'BAN REASON', value: p.ban_reason ?? 'No reason given' }] : []),
                        ...(isSuspended && p.suspension_expires_at ? [{ label: 'SUSPENSION ENDS', value: new Date(p.suspension_expires_at).toLocaleString() }] : []),
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ color: '#B8860B', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '3px' }}>{label}</div>
                          <div style={{ color: '#C0C0C0', fontSize: '13px' }}>{String(value)}</div>
                        </div>
                      ))}
                    </div>

                    {/* Characters section */}
                    <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: '16px' }}>
                      <CharacterPanel playerId={p.id} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
