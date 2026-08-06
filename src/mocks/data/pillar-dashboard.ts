import type { PillarId } from '@/api/schemas/common'
import type {
  PillarCoreIndicator,
  PillarDashboardOverview,
  PillarHeadlineCard,
} from '@/api/schemas/pillar-dashboard'
import { bottlenecksRegister } from './bottlenecks'
import { getKpiProfile, kpiExplorerCatalogue } from './kpi-explorer'
import { programmes, projects } from './programs'

/**
 * Derives each Compact pillar dashboard from data that already exists
 * elsewhere — the four headline cards come from real KpiProfile records
 * (kpi-explorer.ts), and the delivery/bottleneck panel comes from Programs
 * and Bottlenecks records filtered by the same `pillar` field they already
 * carry. Nothing here is a separate, re-typed copy of that data.
 */

const PILLAR_LABELS: Record<PillarId, string> = {
  'generation-network': 'Generation & Network',
  'last-mile-access': 'Last-Mile Access',
  'financially-viable-utilities': 'Financially Viable Utilities',
  'private-sector-participation': 'Private-Sector Participation',
  'regional-integration': 'Regional Integration',
  'clean-cooking': 'Clean Cooking',
}

/** The four real KPI Matrix indicators used as this pillar's headline cards. */
const PILLAR_KPI_IDS: Record<PillarId, readonly [string, string, string, string]> = {
  'generation-network': ['M300-P1-003', 'M300-P1-005', 'M300-P1-004', 'M300-P1-012'],
  'last-mile-access': ['M300-PX-001', 'M300-P2-001', 'M300-P2-003', 'M300-P2-006'],
  'financially-viable-utilities': ['M300-P3-004', 'M300-P3-006', 'M300-P3-009', 'M300-P3-010'],
  'private-sector-participation': ['M300-P4-002', 'M300-P4-003', 'M300-P4-001', 'M300-P4-006'],
  'regional-integration': ['M300-P5-001', 'M300-P5-002', 'M300-P5-003', 'M300-P5-004'],
  'clean-cooking': ['M300-P2-008', 'M300-P2-012', 'M300-P2-010', 'M300-P2-011'],
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function buildHeadlineCard(kpiId: string): PillarHeadlineCard {
  const profile = getKpiProfile(kpiId)
  if (!profile) {
    throw new Error(`Pillar dashboard references unknown KPI id ${kpiId}`)
  }

  return {
    kpiId: profile.id,
    title: profile.name,
    value: profile.currentLabel,
    rawValue: profile.current,
    targetLabel: profile.targetLabel,
    target: profile.target,
    trend: profile.trend,
    validationStatus: profile.validationStatus,
    provenance: profile.provenance,
  }
}

/**
 * Core/Tier 1 indicators shown beyond the four headline cards, grouped for
 * a clean analytics layout. Curated per pillar rather than derived from every
 * `readiness: 'core'` catalogue row, so the grouping reads as an analyst
 * chose it, not as a dump of everything available.
 *
 * Group labels for Private-Sector Participation, Regional Integration and
 * Clean Cooking are taken directly from their page specification's own
 * section titles (`docs/specs/*.md`) — "Enabling Environment", "Interconnectors
 * and Regional Market Reform", "Programme Delivery and Financing" — rather
 * than invented. None of these three pillars had confirmed institutional
 * current values for these indicators at the time this was written (the
 * specification itself frames this section as appearing "when institutional
 * data is available"); each KPI's `currentLabel`/`limitations` in
 * kpi-explorer.ts says explicitly that its numbers are an illustrative
 * placeholder trajectory, not a submitted or validated figure, pending real
 * data from the named source institution.
 */
const PILLAR_CORE_INDICATOR_GROUPS: Partial<Record<PillarId, ReadonlyArray<readonly [string, string]>>> = {
  'financially-viable-utilities': [
    ['M300-P3-001', 'Metering coverage'],
    ['M300-P3-002', 'Metering coverage'],
    ['M300-P3-003', 'Metering coverage'],
    ['M300-P3-007', 'Revenue & collections'],
    ['M300-P3-008', 'Revenue & collections'],
    ['M300-P3-011', 'Tariffs'],
    ['M300-P3-012', 'Tariffs'],
    ['M300-P3-020', 'Service quality'],
    ['M300-P3-013', 'Reform & delivery milestones'],
    ['M300-P3-014', 'Reform & delivery milestones'],
    ['M300-P3-015', 'Reform & delivery milestones'],
    ['M300-P3-021', 'Reform & delivery milestones'],
  ],
  'private-sector-participation': [
    ['M300-P4-003', 'Enabling environment'],
    ['M300-P4-006', 'Enabling environment'],
  ],
  'regional-integration': [
    ['M300-P5-001', 'Interconnectors & regional market reform'],
    ['M300-P5-004', 'Interconnectors & regional market reform'],
  ],
  'clean-cooking': [
    ['M300-P2-010', 'Programme delivery'],
    ['M300-P2-011', 'Programme delivery'],
  ],
}

function buildCoreIndicator(kpiId: string, group: string): PillarCoreIndicator {
  const profile = getKpiProfile(kpiId)
  if (!profile) {
    throw new Error(`Pillar dashboard references unknown KPI id ${kpiId}`)
  }

  return {
    kpiId: profile.id,
    name: profile.name,
    group,
    unit: profile.unit,
    current: profile.current,
    target: profile.target,
    direction: profile.direction,
    history: profile.history.map((point) => point.value),
    validationStatus: profile.validationStatus,
    provenance: profile.provenance,
  }
}

export function buildPillarDashboard(pillar: PillarId): PillarDashboardOverview {
  const kpiIds = PILLAR_KPI_IDS[pillar]

  const pillarProgrammes = programmes.filter((row) => row.pillar === pillar)
  const pillarProjects = projects.filter((row) => row.pillar === pillar)
  const statuses = [...pillarProgrammes.map((row) => row.status), ...pillarProjects.map((row) => row.currentStatus)]
  const counts = ['on-track', 'at-risk', 'delayed', 'blocked', 'completed'].map((status) => ({
    status: status as (typeof statuses)[number],
    count: statuses.filter((entry) => entry === status).length,
  }))

  const bottlenecks = bottlenecksRegister
    .filter((row) => row.pillar === pillar)
    .sort((a, b) => {
      const severityDelta = (SEVERITY_RANK[a.severity] ?? 0) - (SEVERITY_RANK[b.severity] ?? 0)
      return severityDelta !== 0 ? severityDelta : b.ageDays - a.ageDays
    })
    .slice(0, 5)

  return {
    pillar,
    label: PILLAR_LABELS[pillar],
    lastUpdated: '2025-10-14T09:12:00Z',
    headlineCards: kpiIds.map(buildHeadlineCard) as [
      PillarHeadlineCard,
      PillarHeadlineCard,
      PillarHeadlineCard,
      PillarHeadlineCard,
    ],
    coreIndicators: (PILLAR_CORE_INDICATOR_GROUPS[pillar] ?? []).map(([kpiId, group]) =>
      buildCoreIndicator(kpiId, group),
    ),
    deliveryStatus: { counts, total: statuses.length },
    bottlenecks,
    kpis: kpiExplorerCatalogue.filter((row) => row.pillar === pillar),
  }
}
