import { executiveOverviewSchema } from '@/api/schemas/executive-overview'
import { kpiProfileSchema } from '@/api/schemas/kpi-explorer'
import type { ExecutionStatus } from '@/api/schemas/programs'
import { reformActionsOverviewSchema, type ReformAction, type ReformStatus } from '@/api/schemas/reform-actions'
import { api } from '@/lib/api-client'
import type { CompactProgressSource } from './compact-progress-report-data'

const RENEWABLE_GENERATION_SHARE = 'M300-P1-004'
const PRIVATE_CAPITAL = 'M300-P4-008'
const REFORM_PAGE_SIZE = 200

const PRIORITY_ORDER = ['generation-network', 'last-mile-access', 'clean-cooking', 'financially-viable-utilities', 'private-sector-participation', 'regional-integration']

function fromReformActions(reforms: readonly ReformAction[]) {
  return {
    actions: reforms.map((row) => ({ pillar: row.pillar, status: row.status, isPriority: row.isPriority })),
    priorityActions: reforms
      .filter((row) => row.isPriority)
      .sort((a, b) => PRIORITY_ORDER.indexOf(a.pillar) - PRIORITY_ORDER.indexOf(b.pillar))
      .map((row) => ({
        id: row.id,
        pillar: row.pillar,
        commitment: row.commitment,
        action: row.action,
        deadline: row.dueDate ?? row.referenceDueDate,
        status: row.status,
        previousStatus: row.previousStatus,
      })),
  }
}

const PROGRAMME_STATUS_TO_REFORM: Record<ExecutionStatus, ReformStatus> = {
  'on-track': 'in-progress-on-track',
  'at-risk': 'in-progress-at-risk',
  delayed: 'delayed',
  blocked: 'delayed',
  completed: 'completed',
}

async function optionalProfile(code: string) {
  try {
    return await api.get(`/kpi-explorer/kpis/${encodeURIComponent(code)}`, kpiProfileSchema)
  } catch {
    return undefined
  }
}

export async function loadLiveCompactProgressSource(): Promise<CompactProgressSource> {
  const [overview, renewables, privateCapital, reforms] = await Promise.all([
    api.get('/executive-overview', executiveOverviewSchema),
    optionalProfile(RENEWABLE_GENERATION_SHARE),
    optionalProfile(PRIVATE_CAPITAL),
    api.get(`/reform-actions?page=1&pageSize=${REFORM_PAGE_SIZE}`, reformActionsOverviewSchema),
  ])
  return { overview, renewables, privateCapital, ...fromReformActions(reforms.actions.items) }
}

export async function loadMockCompactProgressSource(): Promise<CompactProgressSource> {
  const [{ executiveOverview }, { getKpiProfile }, { programmes, projects }] = await Promise.all([
    import('@/mocks/data/executive-overview'),
    import('@/mocks/data/kpi-explorer'),
    import('@/mocks/data/programs'),
  ])
  const priority = programmes.filter((row) => row.priority === 'priority')
  return {
    overview: executiveOverview,
    renewables: getKpiProfile(RENEWABLE_GENERATION_SHARE),
    privateCapital: getKpiProfile(PRIVATE_CAPITAL),
    actions: [
      ...programmes.map((row) => ({ pillar: row.pillar, status: PROGRAMME_STATUS_TO_REFORM[row.status], isPriority: row.priority === 'priority' })),
      ...projects.map((row) => ({ pillar: row.pillar, status: PROGRAMME_STATUS_TO_REFORM[row.currentStatus], isPriority: false })),
    ],
    priorityActions: priority.map((row) => {
      const history = projects.find((project) => project.programmeId === row.id)?.statusHistory
      const previous = history?.[history.length - 2]?.status
      return {
        id: row.id,
        pillar: row.pillar,
        commitment: row.name,
        action: row.objectives,
        deadline: row.endDate,
        status: PROGRAMME_STATUS_TO_REFORM[row.status],
        previousStatus: previous ? PROGRAMME_STATUS_TO_REFORM[previous] : null,
      }
    }),
  }
}
