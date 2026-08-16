import { useNavigate } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { ProgramsFilters } from './components/programs-filters'
import { ProgramsSkeleton } from './components/programs-skeleton'
import { ProgramsTable } from './components/programs-table'
import { useProgramsPage } from './use-programs-page'

/**
 * Programs.
 *
 * The consolidated home for programme delivery: a portfolio overview that
 * drills into a programme's projects, and from a project into its
 * bottlenecks and milestones. Replaces the earlier standalone Implementation
 * Register and Bottlenecks & Exceptions pages — both are folded in here as
 * drill-down levels rather than separate top-level pages.
 *
 * Uses its own three filters rather than the global dashboard filters, so the
 * route opts out of the global filter bar (see src/app/router.tsx). All state
 * and data-fetching lives in use-programs-page.ts — this component only
 * reads that hook and renders.
 */
export function ProgramsPage() {
  const page = useProgramsPage()
  const navigate = useNavigate()

  if (page.isPending) return <ProgramsSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Programmes could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Delivery tracking' }, { label: 'Programs' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          Programs
        </h1>
      </div>

      {page.filters && (
        <ProgramsFilters
          options={page.filters}
          value={page.query}
          activeFilterCount={page.activeFilterCount}
          onChange={page.changeFilters}
          onReset={page.resetFilters}
        />
      )}

      <ProgramsTable
        records={data.programmes.items}
        page={data.programmes.page}
        pageSize={data.programmes.pageSize}
        total={data.programmes.total}
        onPageChange={page.setPage}
        onOpenProgramme={(programme) => navigate(`/programs/${programme.id}`)}
      />
    </div>
  )
}
