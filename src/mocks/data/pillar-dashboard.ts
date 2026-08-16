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
    baseline: profile.baseline,
    baselineLabel: profile.baselineLabel,
    targetLabel: profile.targetLabel,
    target: profile.target,
    trend: profile.trend,
    validationStatus: profile.validationStatus,
    provenance: profile.provenance,
  }
}

/**
 * Core indicators shown beyond the four headline cards: every KPI Matrix
 * catalogue row tagged to this pillar that isn't already one of the four
 * headline cards, grouped by its own `sourceDataset` (the registry's own
 * category label, e.g. "Metering coverage", "Mini-Grids") — not a curated
 * subset. The dashboard's own request is to show every indicator the
 * registry has for a pillar, not an analyst-picked highlight reel; the full
 * 77-row Master KPI Registry now has a mock entry for every id (see
 * kpi-explorer.ts), so this can safely be exhaustive instead of an allowlist
 * that silently drops new indicators as the registry grows.
 *
 * Many of these are the placeholder-value rows added to reach full registry
 * coverage — each one's own `currentLabel`/`limitations` in kpi-explorer.ts
 * says explicitly that its number is an illustrative placeholder, not a
 * submitted or validated figure, pending real data from the named source
 * institution.
 */
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
    baseline: profile.baseline,
    baselineLabel: profile.baselineLabel,
    currentLabel: profile.currentLabel,
    targetLabel: profile.targetLabel,
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
    coreIndicators: kpiExplorerCatalogue
      .filter((row) => row.pillar === pillar && !kpiIds.includes(row.id))
      .map((row) => buildCoreIndicator(row.id, row.sourceDataset)),
    deliveryStatus: { counts, total: statuses.length },
    bottlenecks,
    kpis: kpiExplorerCatalogue.filter((row) => row.pillar === pillar),
  }
}
