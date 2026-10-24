import { pillarIdSchema, type PillarId } from '@/api/schemas/common'
import { useGlobalFilters } from '@/app/global-filters'
import { usePillarDashboard } from './api'

export function usePillarDashboardPage(pillarParam: string) {
  const parsed = pillarIdSchema.safeParse(pillarParam)
  const pillar: PillarId | null = parsed.success ? parsed.data : null
  const { filters } = useGlobalFilters()

  const overview = usePillarDashboard(pillar, filters.period, filters.institution)

  return {
    pillar,
    data: overview.data,
    isPending: pillar !== null && overview.isPending,
    isError: pillar === null || overview.isError,
    error:
      pillar === null
        ? new Error('Unknown Compact pillar.')
        : (overview.error ?? new Error('The pillar dashboard could not be loaded.')),
    retry: () => void overview.refetch(),
  }
}
