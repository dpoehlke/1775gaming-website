/**
 * Shared loot-tier constants and inventory authenticity flagging.
 *
 * Rarity ladder + colors mirror the `rarity_config` table in the Omniverse
 * project. Sources mirror the `inventory_items_source_check` constraint —
 * an item whose source is outside that list could only have been written by
 * something bypassing the game client, so it is always flagged.
 *
 * Flag logic lives here (server-authoritative) so the reason shown to an
 * admin is the same reason the API computed.
 */

export const RARITY_ORDER = [
  'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'unique',
] as const
export type Rarity = (typeof RARITY_ORDER)[number]

export const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', epic: '#8b5cf6',
  legendary: '#f59e0b', mythic: '#ef4444', unique: '#14b8a6',
}
export const RARITY_LABELS: Record<string, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic',
  legendary: 'Legendary', mythic: 'Mythic', unique: 'Unique',
}
/** Rank for sorting. Unknown rarities sort last. */
export function rarityRank(r: string): number {
  const i = RARITY_ORDER.indexOf(r as Rarity)
  return i === -1 ? 99 : i
}

/** Mirrors inventory_items_source_check. */
export const VALID_SOURCES = [
  'campaign', 'purchase', 'salvage', 'crafted', 'reward', 'loot_crate',
] as const
/** Mirrors inventory_items_type_check. */
export const VALID_ITEM_TYPES = [
  'weapon', 'armor', 'gadget', 'consumable', 'quest_item', 'material',
  'ammo', 'vehicle', 'base_item', 'misc', 'container',
] as const
/** Mirrors inventory_items_slot_check. */
export const VALID_SLOTS = [
  'head', 'chest', 'legs', 'feet', 'main_hand', 'off_hand', 'belt',
  'wrists', 'back', 'none',
] as const

/**
 * Campaign play cannot award above this tier — anything rarer claiming a
 * campaign source came from somewhere else.
 */
const MAX_CAMPAIGN_RARITY = 'epic'

export type FlagSeverity = 'critical' | 'warning'
export type ItemFlag = {
  code: string
  label: string
  /** Human-readable explanation of exactly why this item tripped the rule. */
  reason: string
  severity: FlagSeverity
}

export type FlaggableItem = {
  name: string
  rarity: string
  source: string
  type: string
  quantity: number
  effects: unknown[]
}
/**
 * A known item, keyed by lowercased name. Built from every table that defines
 * legitimate items (item_templates, magical_loot, mundane_loot).
 *
 * `effects` is null for catalogs that don't define effects — the effects check
 * is skipped for those rather than guessing.
 *
 * A name missing from the catalog is NOT evidence of cheating: crafting
 * materials, generated caches, and store items are named in game code and
 * never appear in a table. So there is deliberately no "off-catalog" flag.
 */
export type CatalogEntry = {
  rarity: string
  effects: unknown[] | null
}

/**
 * Returns every reason this item looks inauthentic. Empty array = clean.
 * Rules are deliberately conservative: each one should be hard to produce
 * through legitimate play, so a flag is worth an admin's attention.
 */
export function flagItem(
  item: FlaggableItem,
  catalog: Map<string, CatalogEntry>,
): ItemFlag[] {
  const flags: ItemFlag[] = []
  const effects = Array.isArray(item.effects) ? item.effects : []
  const known = catalog.get((item.name ?? '').trim().toLowerCase())

  if (!item.source || !VALID_SOURCES.includes(item.source as typeof VALID_SOURCES[number])) {
    flags.push({
      code: 'invalid_source',
      label: 'Invalid source',
      severity: 'critical',
      reason: `Source "${item.source || '(empty)'}" is not one of the game's acquisition paths (${VALID_SOURCES.join(', ')}). The item was written by something other than normal gameplay.`,
    })
  }

  if (known) {
    // Only an upgrade is suspicious. A lower rarity than the catalog is a
    // stale definition, not an exploit — it never favours the player.
    if (rarityRank(item.rarity) > rarityRank(known.rarity)) {
      flags.push({
        code: 'rarity_upgraded',
        label: 'Rarity upgraded',
        severity: 'critical',
        reason: `The catalog defines "${item.name}" as ${RARITY_LABELS[known.rarity] ?? known.rarity}, but this copy is ${RARITY_LABELS[item.rarity] ?? item.rarity} — a strictly better tier than the item can legitimately drop at.`,
      })
    }

    if (known.effects !== null && effects.length > known.effects.length) {
      flags.push({
        code: 'extra_effects',
        label: 'Extra effects',
        severity: 'critical',
        reason: `Carries ${effects.length} effect(s); the catalog definition grants ${known.effects.length}. Effects were added to this copy after it dropped.`,
      })
    }
  }

  if (item.source === 'campaign' && rarityRank(item.rarity) > rarityRank(MAX_CAMPAIGN_RARITY)) {
    flags.push({
      code: 'campaign_over_tier',
      label: 'Tier too high for campaign',
      severity: 'critical',
      reason: `Campaign play awards at most ${RARITY_LABELS[MAX_CAMPAIGN_RARITY]} loot, but this item is ${RARITY_LABELS[item.rarity] ?? item.rarity} and claims a campaign source. Expected source for this tier: loot_crate, purchase, or reward.`,
    })
  }

  if (item.quantity > 1 && (item.rarity === 'unique' || item.rarity === 'mythic')) {
    flags.push({
      code: 'stacked_top_tier',
      label: 'Stacked top-tier item',
      severity: 'warning',
      reason: `Quantity ${item.quantity} on a ${RARITY_LABELS[item.rarity]} item. Top-tier loot is not meant to stack — a duplication bug or exploit is the usual cause.`,
    })
  }

  if (item.quantity > 99) {
    flags.push({
      code: 'implausible_quantity',
      label: 'Implausible quantity',
      severity: 'warning',
      reason: `Quantity ${item.quantity} far exceeds normal accumulation and should be verified against the player's activity.`,
    })
  }

  return flags
}

export function worstSeverity(flags: ItemFlag[]): FlagSeverity | null {
  if (flags.some(f => f.severity === 'critical')) return 'critical'
  if (flags.length) return 'warning'
  return null
}
