import { useQuery } from '@tanstack/react-query'
import { dashboardFilterOptionsSchema } from '@/api/schemas/filters'
import { api } from '@/lib/api-client'

export const filterKeys = {
  all: ['filters'] as const,
  options: () => [...filterKeys.all, 'options'] as const,
}

/**
 * Fetches the option lists for the global filter bar.
 *
 * A dedicated endpoint rather than a slice of each page's payload: the filter
 * bar is application chrome, so it must not depend on which page happens to be
 * open. Options change rarely, so this is cached for the session.
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: filterKeys.options(),
    queryFn: () => api.get('/filters', dashboardFilterOptionsSchema),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
