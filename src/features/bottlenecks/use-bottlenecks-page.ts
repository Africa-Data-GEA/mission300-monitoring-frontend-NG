import { useState } from 'react'
import type { BottlenecksQuery } from '@/api/schemas/bottlenecks'
import { useBottlenecks, useBottlenecksFilters } from './api'

const DEFAULT_QUERY: Required<BottlenecksQuery> = {
  search: '',
  severity: 'all',
  category: 'all',
  institution: 'all',
  pillar: 'all',
  linkedRecord: 'all',
  lifecycleStage: 'all',
  escalationStatus: 'all',
  validationStatus: 'all',
  reportingPeriod: 'q3-2025',
}

export function useBottlenecksPage() {
  const [query, setQuery] = useState<Required<BottlenecksQuery>>(DEFAULT_QUERY)
  const [registerPage, setRegisterPage] = useState(1)
  const [escalationPage, setEscalationPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const filters = useBottlenecksFilters()
  const overview = useBottlenecks(query, {
    page: registerPage,
    pageSize: 10,
    escalationPage,
  })

  const activeFilterCount = [
    query.severity !== 'all',
    query.category !== 'all',
    query.institution !== 'all',
    query.pillar !== 'all',
    query.linkedRecord !== 'all',
    query.lifecycleStage !== 'all',
    query.escalationStatus !== 'all',
    query.validationStatus !== 'all',
  ].filter(Boolean).length

  function changeFilters(next: Required<BottlenecksQuery>) {
    setQuery(next)
    // A narrowed result set makes both list's current page number meaningless.
    setRegisterPage(1)
    setEscalationPage(1)
  }

  function resetFilters() {
    changeFilters({ ...DEFAULT_QUERY, search: query.search })
  }

  return {
    query,
    activeFilterCount,
    filters: filters.data,
    data: overview.data,
    isPending: filters.isPending || overview.isPending,
    isError: overview.isError,
    error:
      overview.error ?? new Error('The bottleneck register could not be loaded.'),
    retry: () => void overview.refetch(),
    changeFilters,
    resetFilters,
    setRegisterPage,
    setEscalationPage,
    createOpen,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    refreshAfterCreate: () => void overview.refetch(),
  }
}
