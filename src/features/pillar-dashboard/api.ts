import { useQuery } from '@tanstack/react-query'
import { pillarDashboardOverviewSchema } from '@/api/schemas/pillar-dashboard'
import type { PillarId } from '@/api/schemas/common'
import { api } from '@/lib/api-client'

export const pillarDashboardKeys = {
  all: ['pillar-dashboard'] as const,
  overview: (pillar: PillarId) => [...pillarDashboardKeys.all, pillar] as const,
}

export function usePillarDashboard(pillar: PillarId | null) {
  return useQuery({
    queryKey: pillarDashboardKeys.overview(pillar ?? 'generation-network'),
    queryFn: () => api.get(`/pillars/${pillar}`, pillarDashboardOverviewSchema),
    enabled: pillar !== null,
  })
}
