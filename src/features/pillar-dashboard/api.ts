import { useQuery } from '@tanstack/react-query'
import { pillarDashboardOverviewSchema } from '@/api/schemas/pillar-dashboard'
import type { PillarId } from '@/api/schemas/common'
import { api } from '@/lib/api-client'

export const pillarDashboardKeys = {
  all: ['pillar-dashboard'] as const,
  overview: (pillar: PillarId, period: string) => [...pillarDashboardKeys.all, pillar, period] as const,
}

/** Only `reportingPeriod` is wired through — the endpoint's own filtering
 * is currently period-only (see pillar-dashboard.service.ts), matching the
 * global filter bar's own primary control. */
export function usePillarDashboard(pillar: PillarId | null, period: string) {
  return useQuery({
    queryKey: pillarDashboardKeys.overview(pillar ?? 'generation-network', period),
    queryFn: () =>
      api.get(
        `/pillars/${pillar}?reportingPeriod=${encodeURIComponent(period)}`,
        pillarDashboardOverviewSchema,
      ),
    enabled: pillar !== null,
  })
}
