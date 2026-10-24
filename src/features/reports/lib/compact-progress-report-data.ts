import { PILLARS, PILLAR_LABELS, type PillarId } from '@/api/schemas/common'
import { REFORM_STATUS_LABELS, type ReformStatus } from '@/api/schemas/reform-actions'
import type { ExecutiveOverview } from '@/api/schemas/executive-overview'
import type { KpiProfile } from '@/api/schemas/kpi-explorer'
import {
  cycleHeading,
  formatAsOfDate,
  formatReportMonth,
  type CompactReportParameters,
} from './compact-report-parameters'

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
  readonly status: string
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
  readonly cycleLabel: string
  readonly reportDateLabel: string
  readonly keyTargets: readonly CompactProgressKeyTarget[]
  readonly pillarTargets: readonly CompactProgressPillarTarget[]
  readonly pillars: readonly { readonly id: PillarId; readonly label: string }[]
  readonly statusByPillar: readonly CompactProgressStatusRow[]
  readonly statusTotals: readonly CompactProgressStatusTotal[]
  readonly statusByPriority: {
    readonly priority: readonly CompactProgressStatusTotal[]
    readonly other: readonly CompactProgressStatusTotal[]
  }
  readonly totalActions: number
  readonly totalPriorityActions: number
  readonly priorityActions: readonly CompactProgressPriorityAction[]
}

const STATUS_GROUPS = [
  { status: 'completed', label: 'Completed' },
  { status: 'in-progress', label: 'In progress' },
  { status: 'delayed', label: 'Delayed' },
] as const

function groupOf(status: ReformStatus): string {
  if (status === 'completed' || status === 'delayed') return status
  return 'in-progress'
}

export interface CompactProgressSourceAction {
  readonly pillar: PillarId
  readonly status: ReformStatus
  readonly isPriority: boolean
}

export interface CompactProgressSourcePriority {
  readonly id: string
  readonly pillar: PillarId
  readonly commitment: string
  readonly action: string
  readonly deadline: string | null
  readonly status: ReformStatus
  readonly previousStatus: ReformStatus | null
}

export interface CompactProgressSource {
  readonly overview: Pick<ExecutiveOverview, 'headlineCards' | 'lastUpdated'>
  readonly renewables: Pick<KpiProfile, 'baselineLabel' | 'currentLabel' | 'targetLabel'> | undefined
  readonly privateCapital: Pick<KpiProfile, 'baselineLabel' | 'currentLabel' | 'targetLabel'> | undefined
  readonly actions: readonly CompactProgressSourceAction[]
  readonly priorityActions: readonly CompactProgressSourcePriority[]
}

const NO_DATA_LABEL = 'No data provided yet'

function reportedOrNoData(label: string | undefined): string {
  if (!label || /^(no (current )?(value|data)|not (yet )?(tracked|reported)|-|—)/i.test(label.trim())) return NO_DATA_LABEL
  return label
}

export function buildCompactProgressReportData(
  source: CompactProgressSource,
  countryName = 'Nigeria',
  parameters?: CompactReportParameters,
): CompactProgressReportData {
  const { headlineCards, lastUpdated } = source.overview

  const renewables = source.renewables
  const privateCapital = source.privateCapital

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
      label: 'Share of renewable energy in national generation',
      unit: '% of generation',
      baselineLabel: reportedOrNoData(renewables?.baselineLabel),
      currentLabel: reportedOrNoData(renewables?.currentLabel),
      targetLabel: renewables?.targetLabel ?? 'No approved target',
    },
    {
      label: 'Private capital mobilized',
      unit: 'USD Million',
      baselineLabel: privateCapital?.baselineLabel ?? 'TBC',
      currentLabel: reportedOrNoData(privateCapital?.currentLabel),
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
      label: 'Renewables share',
      description: renewables?.targetLabel ? `Reach ${renewables.targetLabel}.` : 'No approved target on record.',
    },
    {
      pillarId: 'private-sector-participation',
      icon: 'private-capital',
      label: 'Private capital mobilized',
      description: 'Mobilize at least USD 15.5 billion in private capital by 2030 to support last-mile electrification.',
    },
  ]

  const pillars = PILLARS.map((id) => ({ id, label: PILLAR_LABELS[id] }))

  const allStatuses = source.actions

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

  const statusTotals: CompactProgressStatusTotal[] = STATUS_GROUPS.map((group) => ({
    ...group,
    count: allStatuses.filter((entry) => groupOf(entry.status) === group.status).length,
  }))

  const countStatuses = (isPriority: boolean): CompactProgressStatusTotal[] =>
    STATUS_GROUPS.map((group) => ({
      ...group,
      count: allStatuses.filter((entry) => entry.isPriority === isPriority && groupOf(entry.status) === group.status).length,
    }))

  const priorityActions: CompactProgressPriorityAction[] = source.priorityActions.map((row) => ({
    id: row.id,
    pillarLabel: PILLAR_LABELS[row.pillar],
    commitment: row.commitment,
    actionText: row.action,
    deadlineLabel: row.deadline
      ? new Date(row.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'TBC',
    currentStatusLabel: REFORM_STATUS_LABELS[row.status],
    previousStatusLabel: row.previousStatus ? REFORM_STATUS_LABELS[row.previousStatus] : 'N/A',
  }))

  return {
    countryName,
    reportingPeriod: parameters?.periodLabel ?? 'Q1 2026',
    generatedAtLabel: parameters
      ? formatAsOfDate(parameters.asOfDate)
      : new Date(lastUpdated).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
    cycleLabel: parameters ? cycleHeading(parameters) : 'Second cycle of data collection 2025',
    reportDateLabel: parameters ? formatReportMonth(parameters.reportMonth) : '',
    keyTargets,
    pillarTargets,
    pillars,
    statusByPillar,
    statusTotals,
    statusByPriority: { priority: countStatuses(true), other: countStatuses(false) },
    totalActions: allStatuses.length,
    totalPriorityActions: allStatuses.filter((entry) => entry.isPriority).length,
    priorityActions,
  }
}
