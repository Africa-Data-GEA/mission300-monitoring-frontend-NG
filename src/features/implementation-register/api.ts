import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  implementationRegisterFilterOptionsSchema,
  implementationRegisterOverviewSchema,
  importRegisterResponseSchema,
  type ImplementationRegisterPagination,
  type ImplementationRegisterQuery,
  type ImportRegisterRequest,
} from '@/api/schemas/implementation-register'
import { api } from '@/lib/api-client'

export const implementationRegisterKeys = {
  all: ['implementation-register'] as const,
  overview: (query: ImplementationRegisterQuery) =>
    [...implementationRegisterKeys.all, 'overview', query] as const,
  filters: () => [...implementationRegisterKeys.all, 'filters'] as const,
}

const DEFAULT_PAGINATION: ImplementationRegisterPagination = {
  pageSize: 10,
  programmePage: 1,
  projectPage: 1,
  milestonePage: 1,
  actionPage: 1,
}

function toSearchParams(
  query: ImplementationRegisterQuery,
  pagination: ImplementationRegisterPagination,
): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  for (const [key, value] of Object.entries(pagination)) {
    params.set(key, String(value))
  }

  return `?${params.toString()}`
}

/** Option lists for this module's own nine filters. */
export function useImplementationRegisterFilters() {
  return useQuery({
    queryKey: implementationRegisterKeys.filters(),
    queryFn: () =>
      api.get(
        '/implementation-register/filters',
        implementationRegisterFilterOptionsSchema,
      ),
    staleTime: Infinity,
  })
}

export function useImplementationRegister(
  query: ImplementationRegisterQuery = {},
  pagination: ImplementationRegisterPagination = DEFAULT_PAGINATION,
) {
  return useQuery({
    queryKey: [...implementationRegisterKeys.overview(query), pagination],
    queryFn: () =>
      api.get(
        `/implementation-register${toSearchParams(query, pagination)}`,
        implementationRegisterOverviewSchema,
      ),
    // Filtering and paging update the tables in place rather than blanking them.
    placeholderData: keepPreviousData,
  })
}

/**
 * Validates an uploaded register template.
 *
 * A plain async function rather than a mutation hook, matching
 * administration's inviteUser and bottlenecks' createBottleneck: the caller
 * (use-import-register.ts) owns the form and result state.
 */
export function importRegister(input: ImportRegisterRequest) {
  return api.post('/implementation-register/import', input, importRegisterResponseSchema)
}
