import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import {
  createKpiResponseSchema,
  kpiExplorerFilterOptionsSchema,
  kpiExplorerOverviewSchema,
  kpiProfileSchema,
  type CreateKpiRequest,
  type KpiExplorerQuery,
  type SetKpiActiveRequest,
  type SetKpiCurrentValueRequest,
  type UpdateKpiMetadataRequest,
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

/**
 * Updates a KPI's definition metadata (methodology, baseline, target,
 * source) — never `current`/`history`, which only change via a published
 * data submission. System-administrator only — see role-access.ts and the
 * gate in metadata-panel.tsx/values-panel.tsx.
 */
/**
 * Registers a brand-new indicator — see createKpiRequestSchema. Review asked
 * for the ability to add extra KPIs and retire existing ones, not only edit
 * them (docs/M300 Monitoring Platform Feedback.pptx, slide 15).
 */
export function useCreateKpi() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateKpiRequest) =>
      api.post('/kpi-explorer/kpis', input, createKpiResponseSchema),
    onSuccess: () => {
      client.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'kpi-explorer' })
    },
  })
}

/**
 * Retires or restores an indicator. Never deletes — a KPI that has published
 * values stays traceable, it is only hidden from the default catalogue.
 */
export function useSetKpiActive(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SetKpiActiveRequest) =>
      api.patch(`/kpi-explorer/kpis/${id}/active`, input, createKpiResponseSchema),
    onSuccess: () => {
      client.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'kpi-explorer' })
    },
  })
}

export function useUpdateKpiMetadata(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateKpiMetadataRequest) =>
      api.patch(`/kpi-explorer/kpis/${id}`, input, kpiProfileSchema),
    onSuccess: (updated) => {
      // Only the catalogue list (name/source/unit columns) is invalidated
      // to refetch — the profile itself is set directly from this response.
      // Invalidating the profile query too would trigger a refetch, and for
      // the two KPIs proxied live to the real backend (see LIVE_KPI_IDS in
      // handlers.ts), that refetch hits the backend rather than this mock,
      // silently reverting the edit just saved.
      client.setQueryData(kpiExplorerKeys.profile(id), updated)
      client.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'kpi-explorer' && query.queryKey[1] === 'overview' })
    },
  })
}

/**
 * Directly sets a KPI's current value, bypassing the Data Submissions &
 * Validation workflow — an explicit admin override. See
 * setKpiCurrentValueRequestSchema. Same cache-update reasoning as
 * useUpdateKpiMetadata above: set the profile directly rather than
 * invalidating it, so the two live-proxied KPIs aren't silently reverted.
 */
export function useSetKpiCurrentValue(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SetKpiCurrentValueRequest) =>
      api.patch(`/kpi-explorer/kpis/${id}/current-value`, input, kpiProfileSchema),
    onSuccess: (updated) => {
      client.setQueryData(kpiExplorerKeys.profile(id), updated)
      client.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'kpi-explorer' && query.queryKey[1] === 'overview' })
    },
  })
}
