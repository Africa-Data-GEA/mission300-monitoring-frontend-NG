import { keepPreviousData, useQuery, type QueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { executiveOverviewSchema } from '@/api/schemas/executive-overview'
import { api } from '@/lib/api-client'
import { environment } from '@/config/environment'
import type { ExecutiveOverviewQuery } from './types'

const kpiBreakdownSchema = z.array(
  z.object({
    disco: z.string(),
    state: z.string(),
    value: z.number(),
  }),
)
export type KpiBreakdown = z.infer<typeof kpiBreakdownSchema>

/**
 * Real per-DisCo/state breakdown for one KPI, fetched directly from the
 * m300-demo-backend — not through the mock's `/api` same-origin contract,
 * since this is a live-only feature with no mock equivalent. Disabled
 * (returns no data, not an error) when VITE_SUBMISSIONS_BACKEND_URL isn't
 * set, so the section simply doesn't render rather than failing.
 */
export function useKpiBreakdown(kpiId: string) {
  const backendUrl = environment.hybridBackendUrl

  return useQuery({
    queryKey: ['kpi-breakdown', kpiId, backendUrl],
    queryFn: async () => {
      const response = await fetch(`${backendUrl}/api/data-submissions/kpis/${kpiId}/breakdown`)
      if (!response.ok) throw new Error(`Breakdown request failed with status ${response.status}`)
      return kpiBreakdownSchema.parse(await response.json())
    },
    enabled: Boolean(backendUrl),
    retry: false,
  })
}

/** Query keys are centralised so cache invalidation has a single source. */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  executiveOverview: (query: ExecutiveOverviewQuery) =>
    [...dashboardKeys.all, 'executive-overview', query] as const,
}

/**
 * Serialises only the filters Executive Overview's endpoint can actually
 * apply. The remaining global filters (priority, geographic scope,
 * distribution company) are deliberately not sent — see the note in
 * GlobalFilterBar on why they are not yet exposed as controls either.
 *
 * Empty values are omitted so the query string stays readable and two
 * equivalent filter states produce the same URL.
 */
function toSearchParams(query: ExecutiveOverviewQuery): string {
  const params = new URLSearchParams()

  for (const key of ['period', 'pillar', 'institution', 'technology'] as const) {
    const value = query[key]
    if (value) params.set(key, value)
  }

  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

/**
 * Warms the default-filter Executive Overview query into the cache ahead of
 * navigation, so the page's own useQuery below finds the data already there
 * and skips the full-page skeleton entirely.
 *
 * `query` must match exactly what dashboard-page.tsx actually passes on
 * first mount (`useGlobalFilters().filters`, i.e. DEFAULT_FILTER_VALUES
 * until the user changes something) - the query key is the full filters
 * object, so a mismatched shape here is a silent cache miss, not an error.
 *
 * Called from two places: right after a successful login (overlapping the
 * fetch with the redirect itself, rather than waiting for AppShell/
 * DashboardPage to mount before the request even starts), and from
 * AppShell's existing idle-time chunk prefetch, so returning to /dashboard
 * via the sidebar after visiting another page is instant too.
 */
export function prefetchExecutiveOverview(queryClient: QueryClient, query: ExecutiveOverviewQuery) {
  return queryClient.prefetchQuery({
    queryKey: dashboardKeys.executiveOverview(query),
    queryFn: () => api.get(`/executive-overview${toSearchParams(query)}`, executiveOverviewSchema),
  })
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
