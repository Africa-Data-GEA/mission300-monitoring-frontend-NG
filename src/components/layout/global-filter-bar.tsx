import { X } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useGlobalFilters } from '@/app/global-filters'
import { Button } from '@/components/ui/button'
import { DateRangeField } from '@/components/ui/date-range-field'
import { SelectField } from '@/components/ui/select-field'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilterOptions } from '@/features/filters/api'
import { CUSTOM_PERIOD, DEFAULT_FILTER_VALUES } from '@/types/filters'

/**
 * The application-wide filter bar.
 *
 * Lives in the shell rather than on a page, because the specification's
 * filters narrow every module that supports the breakdown — not just the
 * Executive Overview. Selection is held in the URL by GlobalFiltersProvider,
 * so every page's query reads the same values and a filtered view is a
 * shareable link.
 *
 * All seven specified filters are exposed here. Four of them (priority,
 * geographic scope, distribution company, technology) were already modelled
 * in the schema, the URL and the query but had no control to set them —
 * review feedback reported the filter panel as doing nothing (docs/M300
 * Monitoring Platform Feedback.pptx, slide 2).
 */
export function GlobalFilterBar({ onClose }: { onClose?: () => void }) {
  const { filters, setFilter, reset } = useGlobalFilters()
  const { data: options, isPending } = useFilterOptions()

  // Held locally, not in the URL: the preset periods are the shareable
  // contract every page's query reads, and a half-selected range (from with
  // no to) is not a valid period to fetch against.
  const [customRange, setCustomRange] = useState<DateRange | undefined>()

  if (isPending || !options) {
    return <Skeleton className="h-16 w-full rounded-card" />
  }

  const isDirty = Object.entries(DEFAULT_FILTER_VALUES).some(
    ([key, value]) => filters[key as keyof typeof filters] !== value,
  )

  return (
    <section
      id="executive-filter-panel"
      aria-label="Dashboard filters"
      className="rounded-card border border-border-default bg-surface px-3 py-3 shadow-lg sm:px-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-border-default pb-3">
        <div>
          <h2 className="text-sm font-semibold text-text-default">Dashboard filters</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Narrow every module by period, pillar, institution, scope or technology.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isDirty && (
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Reset filters
            </Button>
          )}
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
      </div>

      <div className="flex flex-wrap items-end gap-2.5">
        <SelectField
          label="Reporting period"
          value={filters.period}
          options={options.reportingPeriods}
          onChange={(period) => setFilter('period', period)}
          className="w-full sm:w-40"
        />

        {/* Only once "Custom range…" is chosen, so the bar stays compact by default. */}
        {filters.period === CUSTOM_PERIOD && (
          <DateRangeField
            label="Custom range"
            value={customRange}
            onChange={setCustomRange}
            className="w-full sm:w-64"
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
          label="Technology"
          value={filters.technology}
          options={options.technologies}
          onChange={(technology) => setFilter('technology', technology)}
          className="w-full sm:w-44"
        />

        {/*
          NOT YET EXPOSED: priority, geographicScope and distributionCompany.
          All three are modelled in the schema, carried in the URL and passed
          to the query already, but nothing in the payload can answer them —
          `ongoingProjects` has no priority field, project locations are
          regions ("North East", "Lagos State") with no DisCo mapping, and
          geographic scope is an aggregation level rather than a filter.
          Rendering them would reproduce the reported bug (a control that
          changes nothing), so they stay out until the CDMU's filtering
          requirements define what each should actually narrow.
        */}
      </div>
    </section>
  )
}
