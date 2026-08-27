/**
 * Beneficiary-level event ledger backing the two canonical, SE4ALL-aligned
 * KPIs added alongside it in kpi-explorer.ts: "People Connected to
 * Electricity (Canonical)" (M300-P2-024) and "Clean Cooking — Verified
 * Beneficiary Households (Canonical)" (M300-P2-025).
 *
 * WHY THIS EXISTS. The pre-existing headline cards ("People with electricity
 * access", "Clean cooking access" — see buildPeopleWithElectricityAccessCard
 * and buildCleanCookingAccessCard in executive-overview.ts) are hand-blended
 * composites with `kpiId: null`: no KPI Explorer profile backs their number,
 * so nothing enforces SE4ALL's MRL guidance rules —
 *   - electricity: only connections made since the Compact tracking start,
 *     Multi-Tier-Framework Tier 1+, converted to people, no double-counting
 *     a household that reconnects or upgrades;
 *   - clean cooking: one household counted once despite "stove-stacking"
 *     (owning more than one stove type at once), in the single category that
 *     best reflects its actual cooking situation.
 * Those rules can't be enforced on a single rolled-up number after the fact —
 * they need a beneficiary-event trail underneath the KPI, the same reasoning
 * that put a transaction ledger under Private Capital (M300-P4-002).
 *
 * SCALE. Like M300-P4-002's "illustrative early-pipeline estimate", this
 * ledger is intentionally small and Phase-1: it demonstrates the dedup/
 * eligibility mechanism working end-to-end, not a backfilled replacement for
 * the 137.3M/26% Compact-wide composite figures, which remain the reported
 * headline numbers until CDMU can supply beneficiary-level data at scale.
 */

/** Formal Compact tracking start — matches the convention already used by
 * M300-P4-002's baseline label ("USD 0 at formal Compact tracking start (Jan
 * 2025)"), so every canonical, ledger-backed KPI shares one cutoff. */
export const M300_START_DATE = '2025-01-01'

export type ElectricityConnectionType = 'grid' | 'mini-grid' | 'shs'

/** World Bank Multi-Tier Framework tier, 0 (no access) to 5 (full
 * grid-quality reliability). SE4ALL's guidance requires Tier 1+ to count. */
export type MtfTier = 0 | 1 | 2 | 3 | 4 | 5

export interface ElectricityConnectionEvent {
  readonly id: string
  readonly householdId: string
  readonly connectionType: ElectricityConnectionType
  readonly connectionDate: string
  readonly tier: MtfTier
  readonly householdSize: number
  readonly distributionCompany: string
  /** Set when this event is a reconnection or tier upgrade of an earlier
   * event for the *same* household — a real, separate record, but not a new
   * beneficiary, so it must not be double-counted. */
  readonly supersedesEventId: string | null
}

/** Fourteen households, eighteen events: a mix of first-time connections,
 * reconnections/upgrades of the same household, pre-Compact connections, and
 * sub-Tier-1 connections — every exclusion rule this KPI enforces has at
 * least one event on record to prove it actually excludes something. */
export const ELECTRICITY_CONNECTION_EVENTS: readonly ElectricityConnectionEvent[] = [
  { id: 'ELE-001', householdId: 'HH-1001', connectionType: 'grid', connectionDate: '2024-06-10', tier: 2, householdSize: 5, distributionCompany: 'Ikeja Electric', supersedesEventId: null },
  { id: 'ELE-002', householdId: 'HH-1002', connectionType: 'grid', connectionDate: '2025-02-14', tier: 3, householdSize: 4, distributionCompany: 'Eko Electricity Distribution Company', supersedesEventId: null },
  { id: 'ELE-003', householdId: 'HH-1003', connectionType: 'mini-grid', connectionDate: '2025-03-02', tier: 1, householdSize: 6, distributionCompany: 'Rural Electrification Agency', supersedesEventId: null },
  { id: 'ELE-004', householdId: 'HH-1004', connectionType: 'shs', connectionDate: '2025-03-20', tier: 0, householdSize: 3, distributionCompany: 'Rural Electrification Agency', supersedesEventId: null },
  { id: 'ELE-005', householdId: 'HH-1005', connectionType: 'grid', connectionDate: '2025-04-05', tier: 2, householdSize: 5, distributionCompany: 'Abuja Electricity Distribution Company', supersedesEventId: null },
  { id: 'ELE-006', householdId: 'HH-1005', connectionType: 'grid', connectionDate: '2025-09-18', tier: 3, householdSize: 5, distributionCompany: 'Abuja Electricity Distribution Company', supersedesEventId: 'ELE-005' },
  { id: 'ELE-007', householdId: 'HH-1006', connectionType: 'mini-grid', connectionDate: '2025-05-11', tier: 2, householdSize: 7, distributionCompany: 'Rural Electrification Agency', supersedesEventId: null },
  { id: 'ELE-008', householdId: 'HH-1007', connectionType: 'grid', connectionDate: '2025-05-29', tier: 1, householdSize: 4, distributionCompany: 'Kano Electricity Distribution Company', supersedesEventId: null },
  { id: 'ELE-009', householdId: 'HH-1007', connectionType: 'grid', connectionDate: '2025-11-02', tier: 0, householdSize: 4, distributionCompany: 'Kano Electricity Distribution Company', supersedesEventId: 'ELE-008' },
  { id: 'ELE-010', householdId: 'HH-1008', connectionType: 'shs', connectionDate: '2025-06-08', tier: 1, householdSize: 5, distributionCompany: 'Rural Electrification Agency', supersedesEventId: null },
  { id: 'ELE-011', householdId: 'HH-1009', connectionType: 'grid', connectionDate: '2025-06-30', tier: 2, householdSize: 6, distributionCompany: 'Ibadan Electricity Distribution Company', supersedesEventId: null },
  { id: 'ELE-012', householdId: 'HH-1010', connectionType: 'grid', connectionDate: '2023-11-01', tier: 3, householdSize: 4, distributionCompany: 'Ikeja Electric', supersedesEventId: null },
  { id: 'ELE-013', householdId: 'HH-1011', connectionType: 'mini-grid', connectionDate: '2025-07-19', tier: 1, householdSize: 5, distributionCompany: 'Rural Electrification Agency', supersedesEventId: null },
  { id: 'ELE-014', householdId: 'HH-1012', connectionType: 'grid', connectionDate: '2025-08-14', tier: 2, householdSize: 4, distributionCompany: 'Eko Electricity Distribution Company', supersedesEventId: null },
  { id: 'ELE-015', householdId: 'HH-1013', connectionType: 'shs', connectionDate: '2025-08-27', tier: 1, householdSize: 3, distributionCompany: 'Rural Electrification Agency', supersedesEventId: null },
  { id: 'ELE-016', householdId: 'HH-1014', connectionType: 'grid', connectionDate: '2025-09-09', tier: 2, householdSize: 5, distributionCompany: 'Abuja Electricity Distribution Company', supersedesEventId: null },
  { id: 'ELE-017', householdId: 'HH-1006', connectionType: 'mini-grid', connectionDate: '2025-10-01', tier: 3, householdSize: 7, distributionCompany: 'Rural Electrification Agency', supersedesEventId: 'ELE-007' },
  { id: 'ELE-018', householdId: 'HH-1009', connectionType: 'grid', connectionDate: '2025-10-20', tier: 3, householdSize: 6, distributionCompany: 'Ibadan Electricity Distribution Company', supersedesEventId: 'ELE-011' },
]

export interface ElectricityBeneficiarySummary {
  readonly qualifyingHouseholds: number
  readonly totalPeople: number
  readonly excludedBelowTier: number
  readonly excludedBeforeStart: number
  readonly dedupedUpgradeEvents: number
  readonly asOfPeriod: string
}

/**
 * Applies SE4ALL's three rules in order: drop anything before `sinceDate`,
 * drop anything below `minTier`, then collapse to one (earliest-qualifying)
 * event per household so a later reconnection/upgrade of an already-counted
 * household is not a second beneficiary.
 */
export function summarizeElectricityBeneficiaries(
  events: readonly ElectricityConnectionEvent[] = ELECTRICITY_CONNECTION_EVENTS,
  { sinceDate = M300_START_DATE, minTier = 1 as MtfTier }: { sinceDate?: string; minTier?: MtfTier } = {},
): ElectricityBeneficiarySummary {
  const supersededIds = new Set(
    events.map((event) => event.supersedesEventId).filter((id): id is string => id !== null),
  )
  const eligible = events.filter(
    (event) => !supersededIds.has(event.id) && event.connectionDate >= sinceDate && event.tier >= minTier,
  )

  const byHousehold = new Map<string, ElectricityConnectionEvent>()
  for (const event of eligible) {
    const existing = byHousehold.get(event.householdId)
    if (!existing || event.connectionDate < existing.connectionDate) {
      byHousehold.set(event.householdId, event)
    }
  }

  const qualifying = [...byHousehold.values()]
  return {
    qualifyingHouseholds: qualifying.length,
    totalPeople: qualifying.reduce((sum, event) => sum + event.householdSize, 0),
    excludedBelowTier: events.filter((event) => !supersededIds.has(event.id) && event.tier < minTier).length,
    excludedBeforeStart: events.filter((event) => !supersededIds.has(event.id) && event.connectionDate < sinceDate).length,
    dedupedUpgradeEvents: supersededIds.size,
    asOfPeriod: events.reduce((latest, event) => (event.connectionDate > latest ? event.connectionDate : latest), sinceDate),
  }
}

export type CleanCookingCategory = 'distributed' | 'transitional' | 'verified-use' | 'fully-clean'

export interface CleanCookingHouseholdEvent {
  readonly id: string
  readonly householdId: string
  readonly recordedDate: string
  readonly category: CleanCookingCategory
  readonly stoveType: 'improved-biomass' | 'lpg' | 'electric' | 'biogas'
  readonly householdSize: number
}

/** SE4ALL's ordering from least to most clean — used to pick the single
 * category that best reflects a stove-stacking household's actual cooking
 * situation, not the mere fact that a stove was distributed to it. */
const CATEGORY_RANK: Record<CleanCookingCategory, number> = {
  distributed: 0,
  transitional: 1,
  'verified-use': 2,
  'fully-clean': 3,
}

/** Nine households, thirteen events — three of them (HH-2002, HH-2005,
 * HH-2008) are stove-stacking cases on record twice, at different
 * categories, to prove the collapse picks the best one rather than
 * double-counting the household. */
export const CLEAN_COOKING_HOUSEHOLD_EVENTS: readonly CleanCookingHouseholdEvent[] = [
  { id: 'CC-001', householdId: 'HH-2001', recordedDate: '2025-02-01', category: 'distributed', stoveType: 'improved-biomass', householdSize: 5 },
  { id: 'CC-002', householdId: 'HH-2002', recordedDate: '2025-02-18', category: 'distributed', stoveType: 'improved-biomass', householdSize: 4 },
  { id: 'CC-003', householdId: 'HH-2002', recordedDate: '2025-07-22', category: 'verified-use', stoveType: 'improved-biomass', householdSize: 4 },
  { id: 'CC-004', householdId: 'HH-2003', recordedDate: '2025-03-05', category: 'transitional', stoveType: 'lpg', householdSize: 6 },
  { id: 'CC-005', householdId: 'HH-2004', recordedDate: '2025-03-30', category: 'fully-clean', stoveType: 'lpg', householdSize: 3 },
  { id: 'CC-006', householdId: 'HH-2005', recordedDate: '2025-04-12', category: 'transitional', stoveType: 'lpg', householdSize: 5 },
  { id: 'CC-007', householdId: 'HH-2005', recordedDate: '2025-10-03', category: 'fully-clean', stoveType: 'lpg', householdSize: 5 },
  { id: 'CC-008', householdId: 'HH-2006', recordedDate: '2025-05-09', category: 'verified-use', stoveType: 'biogas', householdSize: 4 },
  { id: 'CC-009', householdId: 'HH-2007', recordedDate: '2025-06-14', category: 'distributed', stoveType: 'improved-biomass', householdSize: 7 },
  { id: 'CC-010', householdId: 'HH-2008', recordedDate: '2025-06-27', category: 'distributed', stoveType: 'electric', householdSize: 3 },
  { id: 'CC-011', householdId: 'HH-2008', recordedDate: '2025-09-15', category: 'verified-use', stoveType: 'electric', householdSize: 3 },
  { id: 'CC-012', householdId: 'HH-2009', recordedDate: '2025-08-02', category: 'fully-clean', stoveType: 'electric', householdSize: 5 },
  { id: 'CC-013', householdId: 'HH-2003', recordedDate: '2025-11-11', category: 'verified-use', stoveType: 'lpg', householdSize: 6 },
]

export interface CleanCookingBeneficiarySummary {
  readonly totalHouseholds: number
  readonly totalPeople: number
  readonly byCategory: Record<CleanCookingCategory, number>
  readonly stackingEventsCollapsed: number
  readonly asOfPeriod: string
}

/** Collapses stove-stacking households to their single best-category event,
 * so a household distributed a biomass stove and later verified on LPG is
 * counted once, as "verified-use" — not twice, and not at the weaker
 * "distributed" category it has since moved past. */
export function summarizeCleanCookingBeneficiaries(
  events: readonly CleanCookingHouseholdEvent[] = CLEAN_COOKING_HOUSEHOLD_EVENTS,
): CleanCookingBeneficiarySummary {
  const bestByHousehold = new Map<string, CleanCookingHouseholdEvent>()
  for (const event of events) {
    const existing = bestByHousehold.get(event.householdId)
    if (!existing || CATEGORY_RANK[event.category] > CATEGORY_RANK[existing.category]) {
      bestByHousehold.set(event.householdId, event)
    }
  }

  const households = [...bestByHousehold.values()]
  const byCategory: Record<CleanCookingCategory, number> = {
    distributed: 0,
    transitional: 0,
    'verified-use': 0,
    'fully-clean': 0,
  }
  for (const household of households) byCategory[household.category] += 1

  return {
    totalHouseholds: households.length,
    totalPeople: households.reduce((sum, household) => sum + household.householdSize, 0),
    byCategory,
    stackingEventsCollapsed: events.length - households.length,
    asOfPeriod: events.reduce((latest, event) => (event.recordedDate > latest ? event.recordedDate : latest), M300_START_DATE),
  }
}
