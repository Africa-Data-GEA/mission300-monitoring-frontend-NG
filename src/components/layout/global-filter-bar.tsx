import { useGlobalFilters } from '@/app/global-filters'
import { SelectField } from '@/components/ui/select-field'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilterOptions } from '@/features/filters/api'

/**
 * The application-wide filter bar.
 *
 * Lives in the shell rather than on a page, because the specification's
 * filters narrow every module that supports the breakdown — not just the
 * Executive Overview. Selection is held in the URL by GlobalFiltersProvider,
 * so every page's query reads the same values and a filtered view is a
 * shareable link.
 *
 * Executive Overview deliberately exposes only filters that the endpoint can
 * apply consistently across leadership metrics and delivery records.
 */
export function GlobalFilterBar({ onClose }: { onClose?: () => void }) {
  const { filters, setFilter } = useGlobalFilters()
  const { data: options, isPending } = useFilterOptions()

  if (isPending || !options) {
    return <Skeleton className="h-16 w-full rounded-card" />
  }

  return (
    <section
      id="executive-filter-panel"
      aria-label="Dashboard filters"
      className="rounded-card border border-border-default bg-surface px-3 py-3 shadow-lg sm:px-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-border-default pb-3">
        <div>
          <h2 className="text-sm font-semibold text-text-default">Executive filters</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Update the reporting snapshot by period, pillar or accountable institution.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text-muted hover:bg-surface-sunken hover:text-text-default"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-2.5">
        <SelectField
          label="Reporting period"
          value={filters.period}
          options={options.reportingPeriods}
          onChange={(period) => setFilter('period', period)}
          className="w-full sm:w-40"
        />

        <SelectField
          label="Compact pillar"
          value={filters.pillar}
          options={options.pillars}
          onChange={(pillar) => setFilter('pillar', pillar)}
          className="w-full sm:w-44"
        />

        <SelectField
          label="Institution"
          value={filters.institution}
          options={options.institutions}
          onChange={(institution) => setFilter('institution', institution)}
          className="w-full sm:w-48"
        />

      </div>
    </section>
  )
}
import { X } from 'lucide-react'
