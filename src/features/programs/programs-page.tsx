import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { SummaryCard } from '@/features/implementation-register/components/summary-card'
import { ProgramsFilters } from './components/programs-filters'
import { ProgramsSkeleton } from './components/programs-skeleton'
import { ProgramsTable } from './components/programs-table'
import { useProgramsPage } from './use-programs-page'

/**
 * Programs.
 *
 * There is no dedicated workbook specification for this page — see
 * src/api/schemas/programs.ts for why. It is a lighter, read-only monitoring
 * surface over the same programme data the Implementation Register manages:
 * the portfolio summary card plus the programme table, linking through to
 * the full register for drill-down and record management.
 *
 * Uses its own three filters rather than the global dashboard filters, so the
 * route opts out of the global filter bar (see src/app/router.tsx). All state
 * and data-fetching lives in use-programs-page.ts — this component only
 * reads that hook and renders.
 */
export function ProgramsPage() {
  const page = useProgramsPage()

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Breadcrumb items={[{ label: 'Monitoring & Analysis' }, { label: 'Programs' }]} />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
            Programs
          </h1>
        </div>
        <Button asChild size="sm" type="button" variant="secondary">
          <Link to="/implementation-register">
            Open Implementation Register
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
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

      <div className="max-w-sm">
        <SummaryCard data={data.summary} />
      </div>

      <ProgramsTable
        records={data.programmes.items}
        page={data.programmes.page}
        pageSize={data.programmes.pageSize}
        total={data.programmes.total}
        onPageChange={page.setPage}
      />
    </div>
  )
}
