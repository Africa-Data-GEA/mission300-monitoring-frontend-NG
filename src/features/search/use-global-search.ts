import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchResponseSchema } from '@/api/schemas/search'
import { api } from '@/lib/api-client'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

/** Debounces `rawQuery` so the search endpoint isn't hit on every keystroke -
 * the query only updates once typing pauses for DEBOUNCE_MS. */
function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

/** Live cross-entity search (KPIs, programmes, projects) behind the topbar's
 * search box - replaces matching only against the static nav menu. */
export function useGlobalSearch(rawQuery: string) {
  const debounced = useDebouncedValue(rawQuery.trim(), DEBOUNCE_MS)
  const enabled = debounced.length >= MIN_QUERY_LENGTH

  const query = useQuery({
    queryKey: ['global-search', debounced],
    queryFn: () =>
      api.get(`/search?q=${encodeURIComponent(debounced)}`, searchResponseSchema),
    enabled,
    staleTime: 30_000,
  })

  return {
    isActive: enabled,
    isPending: enabled && query.isPending,
    results: query.data?.results ?? [],
  }
}
