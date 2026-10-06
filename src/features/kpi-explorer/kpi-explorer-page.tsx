import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
import { CatalogueTable } from './components/catalogue-table'
import { CreateKpiDialog } from './components/create-kpi-dialog'
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
  const [createOpen, setCreateOpen] = useState(false)
  const session = readAuthSession()
  // Create/edit/retire all sit behind the same "kpi-metadata" module key,
  // which only the system-administrator's 'all' sentinel satisfies (see
  // role-access.ts and kpi-profile-dialog.tsx). Data reviewers/validators/
  // dashboard managers can view this directory but must never see the
  // registry-management controls only they'd hit a 403 on.
  const canManageKpis = !!session && canUserReachModule(session.user, 'kpi-metadata')

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
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-text-default">
            KPI Directory
          </h1>
          {/* Registry management — review asked for the ability to add extra
              indicators and retire existing ones, not only edit them
              (docs/M300 Monitoring Platform Feedback.pptx, slide 15).
              System-administrator only — see canManageKpis above. */}
          {canManageKpis && (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden="true" />
              Add indicator
            </Button>
          )}
        </div>
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

      <KpiProfileDialog
        open={page.isProfileOpen}
        profile={page.profile}
        isPending={page.isProfilePending}
        onClose={page.closeProfile}
        onOpenKpi={page.openProfileById}
      />

      {canManageKpis && (
        <CreateKpiDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
    </div>
  )
}
