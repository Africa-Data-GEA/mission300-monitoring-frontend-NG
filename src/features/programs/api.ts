import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  programsFilterOptionsSchema,
  programsOverviewSchema,
  type ProgramsPagination,
  type ProgramsQuery,
} from '@/api/schemas/programs'
import { api } from '@/lib/api-client'

export const programsKeys = {
  all: ['programs'] as const,
  overview: (query: ProgramsQuery) => [...programsKeys.all, 'overview', query] as const,
  filters: () => [...programsKeys.all, 'filters'] as const,
}

const DEFAULT_PAGINATION: ProgramsPagination = { page: 1, pageSize: 10 }

function toSearchParams(query: ProgramsQuery, pagination: ProgramsPagination): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  for (const [key, value] of Object.entries(pagination)) {
    params.set(key, String(value))
  }

  return `?${params.toString()}`
}

/** Option lists for this page's own three filters. */
export function useProgramsFilters() {
  return useQuery({
    queryKey: programsKeys.filters(),
    queryFn: () => api.get('/programs/filters', programsFilterOptionsSchema),
    staleTime: Infinity,
  })
}

export function usePrograms(
  query: ProgramsQuery = {},
  pagination: ProgramsPagination = DEFAULT_PAGINATION,
) {
  return useQuery({
    queryKey: [...programsKeys.overview(query), pagination],
    queryFn: () =>
      api.get(`/programs${toSearchParams(query, pagination)}`, programsOverviewSchema),
    placeholderData: keepPreviousData,
  })
}
