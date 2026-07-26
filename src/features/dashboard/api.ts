import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { executiveOverviewSchema } from '@/api/schemas/executive-overview'
import { api } from '@/lib/api-client'
import type { ExecutiveOverviewQuery } from './types'

/** Query keys are centralised so cache invalidation has a single source. */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  executiveOverview: (query: ExecutiveOverviewQuery) =>
    [...dashboardKeys.all, 'executive-overview', query] as const,
}

/**
 * Serialises the seven Executive Overview filters.
 *
 * Empty values are omitted so the query string stays readable and two
 * equivalent filter states produce the same URL.
 */
function toSearchParams(query: ExecutiveOverviewQuery): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }

  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

export function useExecutiveOverview(query: ExecutiveOverviewQuery = {}) {
  return useQuery({
    queryKey: dashboardKeys.executiveOverview(query),
    queryFn: () =>
      api.get(
        `/executive-overview${toSearchParams(query)}`,
        // Validating here means a contract mismatch fails at the boundary with
        // a named field rather than as `undefined` inside a component.
        executiveOverviewSchema,
      ),
    /*
     * Changing a filter changes the query key, which would otherwise drop the
     * hook back to `pending` and blank the page behind a skeleton on every
     * interaction. Keeping the previous payload means the figures stay on
     * screen and update in place once the new data lands; `isFetching` drives
     * a subtle busy state instead. The skeleton is then reserved for the
     * genuine first load, when there is nothing to show.
     */
    placeholderData: keepPreviousData,
  })
}
