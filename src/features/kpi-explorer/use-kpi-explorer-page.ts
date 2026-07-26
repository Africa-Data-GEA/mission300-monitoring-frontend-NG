import { useMemo, useState } from 'react'
import type { KpiCatalogueRow, KpiExplorerQuery } from '@/api/schemas/kpi-explorer'
import { useKpiExplorer, useKpiExplorerFilters, useKpiProfile } from './api'
import type { KpiFilterValues } from './components/kpi-explorer-filters'

const DEFAULT_FILTERS: KpiFilterValues = {
  search: '',
  pillar: 'all',
  category: 'all',
  readiness: 'all',
  validationStatus: 'all',
  sourceInstitution: 'all',
  reportingPeriod: 'q3-2025',
  geography: 'national',
}

/**
 * Filters that count as "active" for the More-filters badge.
 *
 * Search and the two always-set fields (reporting period, geography) are
 * excluded so the badge reflects real narrowing rather than the defaults.
 */
function countActiveFilters(filters: KpiFilterValues): number {
  return [
    filters.pillar !== 'all',
    filters.category !== 'all',
    filters.readiness !== 'all',
    filters.validationStatus !== 'all',
    filters.sourceInstitution !== 'all',
    filters.geography !== 'national',
  ].filter(Boolean).length
}

/**
 * All state and derived data for the KPI Explorer page.
 *
 * Kept separate from kpi-explorer-page.tsx so the page component is pure
 * presentation: it reads this hook and renders, with no state of its own.
 */
export function useKpiExplorerPage() {
  const [filters, setFilters] = useState<KpiFilterValues>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const query = useMemo<KpiExplorerQuery>(
    () => ({ ...filters, page }),
    [filters, page],
  )

  const options = useKpiExplorerFilters()
  const overview = useKpiExplorer(query)
  const profile = useKpiProfile(selectedId)

  function changeFilters(next: KpiFilterValues) {
    setFilters(next)
    // A narrowed result set makes the current page number meaningless.
    setPage(1)
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  function openProfile(row: KpiCatalogueRow) {
    setSelectedId(row.id)
  }

  function closeProfile() {
    setSelectedId(null)
  }

  return {
    filters,
    activeFilterCount: countActiveFilters(filters),
    filterOptions: options.data,
    data: overview.data,
    isPending: options.isPending || overview.isPending,
    isError: overview.isError,
    error:
      overview.error ?? new Error('The KPI Explorer data could not be loaded.'),
    retry: () => void overview.refetch(),
    changeFilters,
    resetFilters,
    setPage,
    profile: profile.data,
    isProfilePending: profile.isPending,
    isProfileOpen: selectedId !== null,
    openProfile,
    closeProfile,
  }
}
