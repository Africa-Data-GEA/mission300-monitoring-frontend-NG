import { PILLARS, PILLAR_LABELS, type PillarId } from '@/api/schemas/common'
import { EXECUTION_STATUS_LABELS, type ExecutionStatus } from '@/api/schemas/programs'
import { executiveOverview } from '@/mocks/data/executive-overview'
import { getKpiProfile } from '@/mocks/data/kpi-explorer'
import { programmes, projects } from '@/mocks/data/programs'

/**
 * Assembles the data the bespoke Compact Progress Report PDF needs, from the
 * app's own existing mock modules — the same ones the dashboard, pillar
 * pages and Programs already read from.
 *
 * WHY A SEPARATE SHAPE, NOT `ReportPreview`. Every other report type funnels
 * through the generic builder's `reportSectionSchema` (title/columns/rows of
 * strings), because those reports are user-filterable tables. This document
 * is neither filterable nor tabular in most of its sections (an org-chart
 * diagram, a cross-tab, a detail table with badge-styled status cells) — a
 * dedicated typed shape is honest about that rather than flattening
 * everything into strings to fit a contract built for a different job.
 *
 * WHY PROGRAMMES/PROJECTS STAND IN FOR "REFORM ACTIONS". The real CPR this
 * is modelled on tracks Reform Actions — a concept this app has never
 * tracked. Programmes and Projects are the closest real equivalent already
 * in the app: both carry a `pillar`, an execution status, and — on
 * Programmes — the same `priority: 'priority' | 'standard'` split the real
 * report's Priority/Other rows use. Substituting the app's own delivery
 * data into the reference document's table *shapes* is the whole point of
 * this feature (see the approved plan) — not inventing a parallel
 * reform-tracking dataset.
 */

export interface CompactProgressKeyTarget {
  readonly label: string
  readonly unit: string
  readonly baselineLabel: string
  readonly currentLabel: string
  readonly targetLabel: string
}

export interface CompactProgressPillarTarget {
  readonly pillarId: PillarId
  readonly icon: 'electricity-access' | 'clean-cooking' | 'renewables' | 'private-capital'
  readonly label: string
  readonly description: string
}

export interface CompactProgressStatusRow {
  readonly pillarId: PillarId
  readonly pillarLabel: string
  readonly priorityCount: number
  readonly otherCount: number
  readonly total: number
}

export interface CompactProgressStatusTotal {
  readonly status: ExecutionStatus
  readonly label: string
  readonly count: number
}

export interface CompactProgressPriorityAction {
  readonly id: string
  readonly pillarLabel: string
  readonly commitment: string
  readonly actionText: string
  readonly deadlineLabel: string
  readonly currentStatusLabel: string
  readonly previousStatusLabel: string
}

export interface CompactProgressReportData {
  readonly countryName: string
  readonly reportingPeriod: string
  readonly generatedAtLabel: string
  readonly keyTargets: readonly CompactProgressKeyTarget[]
  readonly pillarTargets: readonly CompactProgressPillarTarget[]
  readonly pillars: readonly { readonly id: PillarId; readonly label: string }[]
  readonly statusByPillar: readonly CompactProgressStatusRow[]
  readonly statusTotals: readonly CompactProgressStatusTotal[]
  readonly totalActions: number
  readonly totalPriorityActions: number
  readonly priorityActions: readonly CompactProgressPriorityAction[]
}

/** The five reform-action statuses this report cross-tabs by — every status
 * except `completed`'s absence would misreport progress, so all five are
 * always present in `statusTotals`, even at zero. */
const CROSS_TAB_STATUSES: readonly ExecutionStatus[] = [
  'on-track',
  'at-risk',
  'delayed',
  'blocked',
  'completed',
]

export function buildCompactProgressReportData(countryName = 'Nigeria'): CompactProgressReportData {
  const { headlineCards, lastUpdated } = executiveOverview

  // SE4ALL MRL alignment (docs/se4all-mrl-alignment-renewable-private-capital.md):
  // the CPR must report the CPR-canonical figure, which is NOT the same
  // number the day-to-day Executive Overview dashboard shows for either
  // metric. Renewable share on the dashboard is generation-mix (GWh/GWh,
  // M300-P1-004) — SE4ALL's CPR indicator is installed-capacity share
  // (MW/MW, M300-P1-015). Private capital on the dashboard is the legacy
  // manually-entered total (M300-P4-002) — SE4ALL's CPR indicator is the
  // verified, exclusion-enforced ledger figure (M300-P4-008). Reading these
  // two KPI Explorer profiles directly, rather than `nationalPerformance`,
  // is what keeps the dashboard's own figures unchanged while fixing what
  // the CPR itself reports.
  const renewables = getKpiProfile('M300-P1-015')
  const privateCapital = getKpiProfile('M300-P4-008')

  const keyTargets: CompactProgressKeyTarget[] = [
    {
      label: 'People with new electricity access',
      unit: '# of people',
      baselineLabel: headlineCards.peopleWithElectricityAccess.baselineLabel,
      currentLabel: headlineCards.peopleWithElectricityAccess.value,
      targetLabel: headlineCards.peopleWithElectricityAccess.targetLabel,
    },
    {
      label: 'Clean cooking',
      unit: '% of population',
      baselineLabel: headlineCards.cleanCookingAccess.baselineLabel,
      currentLabel: headlineCards.cleanCookingAccess.value,
      targetLabel: headlineCards.cleanCookingAccess.targetLabel,
    },
    {
      label: 'Renewable installed capacity share (CPR-canonical)',
      unit: '% of installed capacity',
      baselineLabel: renewables?.baselineLabel ?? 'Not tracked',
      currentLabel: renewables?.currentLabel ?? 'Not tracked',
      targetLabel: renewables?.targetLabel ?? 'No approved target',
    },
    {
      label: 'Private capital mobilized (CPR-canonical, verified ledger)',
      unit: 'USD Million',
      baselineLabel: privateCapital?.baselineLabel ?? 'TBC',
      currentLabel: privateCapital?.currentLabel ?? 'No data provided yet',
      targetLabel: privateCapital?.targetLabel ?? 'No approved target',
    },
  ]

  const pillarTargets: CompactProgressPillarTarget[] = [
    {
      pillarId: 'last-mile-access',
      icon: 'electricity-access',
      label: 'Electricity access',
      description: headlineCards.peopleWithElectricityAccess.targetLabel,
    },
    {
      pillarId: 'clean-cooking',
      icon: 'clean-cooking',
      label: 'Clean cooking access',
      description: headlineCards.cleanCookingAccess.targetLabel,
    },
    {
      pillarId: 'generation-network',
      icon: 'renewables',
      label: 'Renewable installed capacity share',
      description: renewables?.targetLabel ? `Reach ${renewables.targetLabel}.` : 'No approved target on record.',
    },
    {
      pillarId: 'private-sector-participation',
      icon: 'private-capital',
      label: 'Private capital mobilized (verified ledger)',
      description: privateCapital?.targetLabel ? `Mobilize ${privateCapital.targetLabel}.` : 'No approved target on record.',
    },
  ]

  const pillars = PILLARS.map((id) => ({ id, label: PILLAR_LABELS[id] }))

  // Every programme AND project is one "action" against its pillar — the
  // same population the pillar dashboards' own delivery-status counts read
  // from (see buildPillarDashboard in mocks/data/pillar-dashboard.ts).
  const allStatuses: { pillar: PillarId; status: ExecutionStatus; isPriority: boolean }[] = [
    ...programmes.map((row) => ({ pillar: row.pillar, status: row.status, isPriority: row.priority === 'priority' })),
    ...projects.map((row) => ({ pillar: row.pillar, status: row.currentStatus, isPriority: false })),
  ]

  const statusByPillar: CompactProgressStatusRow[] = pillars.map(({ id, label }) => {
    const rows = allStatuses.filter((entry) => entry.pillar === id)
    const priorityCount = rows.filter((entry) => entry.isPriority).length
    return {
      pillarId: id,
      pillarLabel: label,
      priorityCount,
      otherCount: rows.length - priorityCount,
      total: rows.length,
    }
  })

  const statusTotals: CompactProgressStatusTotal[] = CROSS_TAB_STATUSES.map((status) => ({
    status,
    label: EXECUTION_STATUS_LABELS[status],
    count: allStatuses.filter((entry) => entry.status === status).length,
  }))

  const priorityActions: CompactProgressPriorityAction[] = programmes
    .filter((row) => row.priority === 'priority')
    .map((row) => {
      const priorityProjects = projects.filter((project) => project.programmeId === row.id)
      const project = priorityProjects[0]
      const previousStatus = project?.statusHistory[project.statusHistory.length - 2]
      return {
        id: row.id,
        pillarLabel: PILLAR_LABELS[row.pillar],
        commitment: row.name,
        actionText: row.objectives,
        deadlineLabel: new Date(row.endDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        currentStatusLabel: EXECUTION_STATUS_LABELS[row.status],
        previousStatusLabel: previousStatus ? EXECUTION_STATUS_LABELS[previousStatus.status] : 'N/A',
      }
    })

  return {
    countryName,
    reportingPeriod: 'Q1 2026',
    generatedAtLabel: new Date(lastUpdated).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    keyTargets,
    pillarTargets,
    pillars,
    statusByPillar,
    statusTotals,
    totalActions: allStatuses.length,
    totalPriorityActions: allStatuses.filter((entry) => entry.isPriority).length,
    priorityActions,
  }
}
