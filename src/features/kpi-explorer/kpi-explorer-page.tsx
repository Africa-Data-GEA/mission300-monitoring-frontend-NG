import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { CatalogueTable } from './components/catalogue-table'
import { Distributions } from './components/distributions/distributions'
import { KpiExplorerFilters } from './components/kpi-explorer-filters'
import { KpiExplorerSkeleton } from './components/kpi-explorer-skeleton'
import { KpiProfileDialog } from './components/kpi-profile/kpi-profile-dialog'
import { useKpiExplorerPage } from './use-kpi-explorer-page'

/**
 * KPI Explorer — the authoritative indicator catalogue and technical
 * drill-down.
 * Specification: docs/specs/kpi-explorer.md
 *
 * Uses its own eight filters rather than the global dashboard filters, so the
 * route opts out of the global filter bar (see src/app/router.tsx).
 *
 * All state and data-fetching lives in use-kpi-explorer-page.ts — this
 * component only reads that hook and renders.
 */
export function KpiExplorerPage() {
  const page = useKpiExplorerPage()

  if (page.isPending) return <KpiExplorerSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="KPI Directory could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Monitoring & Analysis' },
            { label: 'KPI Directory' },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          KPI Directory
        </h1>
      </div>

      {page.filterOptions && (
        <KpiExplorerFilters
          options={page.filterOptions}
          value={page.filters}
          activeFilterCount={page.activeFilterCount}
          onChange={page.changeFilters}
          onReset={page.resetFilters}
        />
      )}

      <CatalogueTable
        rows={data.catalogue.items}
        page={data.catalogue.page}
        pageSize={data.catalogue.pageSize}
        total={data.catalogue.total}
        onPageChange={page.setPage}
        onOpenProfile={page.openProfile}
      />

      <Distributions
        byPillar={data.pillarDistribution}
        byReadiness={data.readinessDistribution}
      />

      <KpiProfileDialog
        open={page.isProfileOpen}
        profile={page.profile}
        isPending={page.isProfilePending}
        onClose={page.closeProfile}
      />
    </div>
  )
}
