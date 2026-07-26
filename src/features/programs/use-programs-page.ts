import { useState } from 'react'
import type { ProgramsQuery } from '@/api/schemas/programs'
import { usePrograms, useProgramsFilters } from './api'

const DEFAULT_QUERY: Required<ProgramsQuery> = {
  search: '',
  pillar: 'all',
  institution: 'all',
  status: 'all',
}

export function useProgramsPage() {
  const [query, setQuery] = useState<Required<ProgramsQuery>>(DEFAULT_QUERY)
  const [page, setPage] = useState(1)

  const filters = useProgramsFilters()
  const overview = usePrograms(query, { page, pageSize: 10 })

  const activeFilterCount = [
    query.pillar !== 'all',
    query.institution !== 'all',
    query.status !== 'all',
  ].filter(Boolean).length

  function changeFilters(next: Required<ProgramsQuery>) {
    setQuery(next)
    setPage(1)
  }

  return {
    query,
    activeFilterCount,
    filters: filters.data,
    data: overview.data,
    isPending: filters.isPending || overview.isPending,
    isError: overview.isError,
    error: overview.error ?? new Error('The programme portfolio could not be loaded.'),
    retry: () => void overview.refetch(),
    changeFilters,
    resetFilters: () => changeFilters({ ...DEFAULT_QUERY, search: query.search }),
    setPage,
  }
}
