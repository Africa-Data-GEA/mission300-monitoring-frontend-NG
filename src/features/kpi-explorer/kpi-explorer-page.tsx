import { useMemo, useState } from 'react'
import type {
  KpiCatalogueRow,
  KpiExplorerQuery,
} from '@/api/schemas/kpi-explorer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useKpiExplorer, useKpiExplorerFilters, useKpiProfile } from './api'
import { CatalogueSummary } from './components/catalogue-summary'
import { CatalogueTable } from './components/catalogue-table'
import { KpiExplorerSkeleton } from './components/kpi-explorer-skeleton'
import { Distributions } from './components/distributions/distributions'
import {
  KpiExplorerFilters,
  type KpiFilterValues,
} from './components/kpi-explorer-filters'
import { KpiProfileDialog } from './components/kpi-profile/kpi-profile-dialog'

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

/** Filters that count as "active" for the More-filters badge. Search and the
 * two always-set periods are excluded so the badge reflects real narrowing. */
function countActive(filters: KpiFilterValues): number {
  let count = 0
  if (filters.pillar !== 'all') count += 1
  if (filters.category !== 'all') count += 1
  if (filters.readiness !== 'all') count += 1
  if (filters.validationStatus !== 'all') count += 1
  if (filters.sourceInstitution !== 'all') count += 1
  if (filters.geography !== 'national') count += 1
  return count
}

/**
 * KPI Explorer — the authoritative indicator catalogue and technical
 * drill-down.
 * Specification: docs/specs/kpi-explorer.md
 *
 * Uses its own eight filters rather than the global dashboard filters, so the
 * route opts out of the global filter bar (see src/app/router.tsx).
 */
export function KpiExplorerPage() {
  const [filters, setFilters] = useState<KpiFilterValues>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const query = useMemo<KpiExplorerQuery>(
    () => ({ ...filters, page }),
    [filters, page],
  )

  const options = useKpiExplorerFilters()
  const { data, isPending, isError, error, refetch } = useKpiExplorer(query)
  const profile = useKpiProfile(selectedId)

  if (isPending || options.isPending) return <KpiExplorerSkeleton />

  if (isError) {
    return (
      <Card className="p-8 text-center" role="alert">
        <h1 className="text-lg font-semibold text-text-default">
          KPI Explorer could not be loaded
        </h1>
        <p className="mx-auto mt-2 max-w-prose text-sm text-text-muted">
          {error.message}
        </p>
        <Button onClick={() => void refetch()} className="mt-5">
          Try again
        </Button>
      </Card>
    )
  }

  function openProfile(row: KpiCatalogueRow) {
    setSelectedId(row.id)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Monitoring & Analysis' },
            { label: 'KPI Explorer' },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          KPI Explorer
        </h1>
      </div>

      {options.data && (
        <KpiExplorerFilters
          options={options.data}
          value={filters}
          activeFilterCount={countActive(filters)}
          onChange={(next) => {
            setFilters(next)
            // A narrowed result set makes the current page number meaningless.
            setPage(1)
          }}
          onReset={() => {
            setFilters(DEFAULT_FILTERS)
            setPage(1)
          }}
        />
      )}

      <CatalogueSummary cards={data.summary} />

      <CatalogueTable
        rows={data.catalogue.items}
        page={data.catalogue.page}
        pageSize={data.catalogue.pageSize}
        total={data.catalogue.total}
        onPageChange={setPage}
        onOpenProfile={openProfile}
      />

      <Distributions
        byPillar={data.pillarDistribution}
        byReadiness={data.readinessDistribution}
      />

      <KpiProfileDialog
        open={selectedId !== null}
        profile={profile.data}
        isPending={profile.isPending}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
