import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import {
  kpiExplorerFilterOptionsSchema,
  kpiExplorerOverviewSchema,
  kpiProfileSchema,
  type KpiExplorerQuery,
} from '@/api/schemas/kpi-explorer'
import { api } from '@/lib/api-client'

export const kpiExplorerKeys = {
  all: ['kpi-explorer'] as const,
  overview: (query: KpiExplorerQuery) =>
    [...kpiExplorerKeys.all, 'overview', query] as const,
  filters: () => [...kpiExplorerKeys.all, 'filters'] as const,
  profile: (id: string) => [...kpiExplorerKeys.all, 'profile', id] as const,
}

function toSearchParams(query: KpiExplorerQuery): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }

  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

/** Option lists for this module's own filters. */
export function useKpiExplorerFilters() {
  return useQuery({
    queryKey: kpiExplorerKeys.filters(),
    queryFn: () =>
      api.get('/kpi-explorer/filters', kpiExplorerFilterOptionsSchema),
    staleTime: Infinity,
  })
}

export function useKpiExplorer(query: KpiExplorerQuery = {}) {
  return useQuery({
    queryKey: kpiExplorerKeys.overview(query),
    queryFn: () =>
      api.get(`/kpi-explorer${toSearchParams(query)}`, kpiExplorerOverviewSchema),
    // Filtering and paging update the table in place rather than blanking it.
    placeholderData: keepPreviousData,
  })
}

/**
 * Fetches one indicator's full profile for the drill-down.
 *
 * Disabled until an id is selected, so opening the page does not fetch a
 * profile nobody asked for.
 */
export function useKpiProfile(id: string | null) {
  return useQuery({
    queryKey: kpiExplorerKeys.profile(id ?? ''),
    queryFn: () => api.get(`/kpi-explorer/kpis/${id}`, kpiProfileSchema),
    enabled: id !== null,
  })
}
