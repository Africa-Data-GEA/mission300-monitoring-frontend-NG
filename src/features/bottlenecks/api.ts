import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  bottlenecksFilterOptionsSchema,
  bottlenecksOverviewSchema,
  createBottleneckResponseSchema,
  type BottlenecksPagination,
  type BottlenecksQuery,
  type CreateBottleneckRequest,
} from '@/api/schemas/bottlenecks'
import { api } from '@/lib/api-client'

export const bottlenecksKeys = {
  all: ['bottlenecks'] as const,
  overview: (query: BottlenecksQuery) =>
    [...bottlenecksKeys.all, 'overview', query] as const,
  filters: () => [...bottlenecksKeys.all, 'filters'] as const,
}

const DEFAULT_PAGINATION: BottlenecksPagination = {
  page: 1,
  pageSize: 10,
  escalationPage: 1,
}

function toSearchParams(
  query: BottlenecksQuery,
  pagination: BottlenecksPagination,
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
export function useBottlenecksFilters() {
  return useQuery({
    queryKey: bottlenecksKeys.filters(),
    queryFn: () => api.get('/bottlenecks/filters', bottlenecksFilterOptionsSchema),
    staleTime: Infinity,
  })
}

export function useBottlenecks(
  query: BottlenecksQuery = {},
  pagination: BottlenecksPagination = DEFAULT_PAGINATION,
) {
  return useQuery({
    queryKey: [...bottlenecksKeys.overview(query), pagination],
    queryFn: () =>
      api.get(
        `/bottlenecks${toSearchParams(query, pagination)}`,
        bottlenecksOverviewSchema,
      ),
    // Filtering and paging update the register in place rather than blanking it.
    placeholderData: keepPreviousData,
  })
}

/**
 * Creates a new bottleneck / exception record.
 *
 * A plain async function rather than a mutation hook, matching
 * administration's inviteUser: the caller (use-create-bottleneck.ts) owns the
 * form and error state, and the page refetches its overview query after a
 * successful create — see refreshAfterCreate in use-bottlenecks-page.ts.
 */
export function createBottleneck(input: CreateBottleneckRequest) {
  return api.post('/bottlenecks', input, createBottleneckResponseSchema)
}
