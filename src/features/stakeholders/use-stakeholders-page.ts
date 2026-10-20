import { useState } from 'react'
import type { StakeholdersQuery } from '@/api/schemas/stakeholders'
import { useStakeholders } from './api'

const DEFAULT_QUERY: Required<StakeholdersQuery> = {
  search: '',
  institutionType: 'all',
  role: 'all',
  status: 'all',
  dataset: 'all',
  kpi: 'all',
  programme: 'all',
  coverage: 'all',
}

export function useStakeholdersPage() {
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const overview = useStakeholders(query)
  const activeFilterCount = [
    query.institutionType !== 'all',
    query.role !== 'all',
    query.status !== 'all',
    query.dataset !== 'all',
    query.kpi !== 'all',
    query.programme !== 'all',
    query.coverage !== 'all',
  ].filter(Boolean).length

  return {
    ...overview,
    activeFilterCount,
    query,
    changeQuery: setQuery,
    resetQuery: () => setQuery((current) => ({ ...DEFAULT_QUERY, search: current.search })),
  }
}
