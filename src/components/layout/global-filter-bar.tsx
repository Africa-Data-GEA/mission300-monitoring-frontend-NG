import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useGlobalFilters } from '@/app/global-filters'
import { Button } from '@/components/ui/button'
import { DateRangeField } from '@/components/ui/date-range-field'
import { SelectField } from '@/components/ui/select-field'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilterOptions } from '@/features/filters/api'
import { CUSTOM_PERIOD } from '@/types/filters'

/**
 * The application-wide filter bar.
 *
 * Lives in the shell rather than on a page, because the specification's
 * filters narrow every module that supports the breakdown — not just the
 * Executive Overview. Selection is held in the URL by GlobalFiltersProvider,
 * so every page's query reads the same values and a filtered view is a
 * shareable link.
 *
 * Geographic scope, Distribution Company and Technology sit behind a "More
 * filters" disclosure, as the specification describes, because they only
 * affect metrics that support those breakdowns.
 */
export function GlobalFilterBar() {
  const { filters, setFilter } = useGlobalFilters()
  const { data: options, isPending } = useFilterOptions()
  const [showMore, setShowMore] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  if (isPending || !options) {
    return <Skeleton className="h-16 w-full rounded-card" />
  }

  return (
    <section
      aria-label="Dashboard filters"
      className="rounded-card bg-surface px-3 py-3 sm:px-4"
    >
      <div className="flex flex-wrap items-end gap-2.5">
        <SelectField
          label="Reporting period"
          value={filters.period}
          options={options.reportingPeriods}
          onChange={(period) => setFilter('period', period)}
          className="w-full sm:w-40"
        />

        {filters.period === CUSTOM_PERIOD && (
          <DateRangeField
            label="Custom range"
            value={dateRange}
            onChange={setDateRange}
            className="w-full sm:w-60"
          />
        )}

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

        <SelectField
          label="Priority"
          value={filters.priority}
          options={options.priorities}
          onChange={(priority) => setFilter('priority', priority)}
          className="w-full sm:w-36"
        />

        <Button
          variant="secondary"
          onClick={() => setShowMore((previous) => !previous)}
          aria-expanded={showMore}
          aria-controls="more-filters"
        >
          <SlidersHorizontal />
          More filters
        </Button>
      </div>

      {showMore && (
        <div
          id="more-filters"
          className="mt-3 flex flex-wrap items-end gap-2.5 border-t border-border-default pt-3"
        >
          <SelectField
            label="Geographic scope"
            value={filters.geographicScope}
            options={options.geographicScopes}
            onChange={(scope) => setFilter('geographicScope', scope)}
            className="w-full sm:w-44"
          />

          <SelectField
            label="Distribution Company"
            value={filters.distributionCompany}
            options={options.distributionCompanies}
            onChange={(disco) => setFilter('distributionCompany', disco)}
            className="w-full sm:w-52"
          />

          <SelectField
            label="Technology or intervention"
            value={filters.technology}
            options={options.technologies}
            onChange={(technology) => setFilter('technology', technology)}
            className="w-full sm:w-48"
          />

          {/*
            The specification notes these only affect metrics supporting those
            breakdowns, which is not obvious from the controls alone.
          */}
          <p className="mb-2 max-w-xs text-xs text-text-subtle">
            These apply only to metrics that support the breakdown.
          </p>
        </div>
      )}
    </section>
  )
}
