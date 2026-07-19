import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { DateRangeField } from '@/components/ui/date-range-field'
import { SelectField } from '@/components/ui/select-field'
import { formatRelativeTime } from '@/lib/format'
import type {
  ExecutiveOverviewFilters,
  ExecutiveOverviewQuery,
} from '../types'

/** Reporting-period value that reveals the custom date-range picker. */
export const CUSTOM_PERIOD = 'custom'

export type FilterValues = Required<ExecutiveOverviewQuery>

/**
 * Section E — Executive Overview filters.
 *
 * All seven specified filters are present. Geographic scope, Distribution
 * Company and Technology sit behind a "More filters" disclosure, as the
 * specification describes, because they only affect metrics that support
 * those breakdowns.
 *
 * Options are supplied by the API rather than hardcoded, so adding an
 * institution or a DisCo is a backend change with no frontend release.
 */
export function FilterBar({
  filters,
  value,
  onChange,
  dateRange,
  onDateRangeChange,
  lastUpdated,
}: {
  filters: ExecutiveOverviewFilters
  value: FilterValues
  onChange: (next: FilterValues) => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  lastUpdated: string
}) {
  const [showMore, setShowMore] = useState(false)

  return (
    <section
      aria-label="Dashboard filters"
      className="rounded-card bg-surface px-4 py-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          label="Reporting period"
          value={value.period}
          options={filters.reportingPeriods}
          onChange={(period) => onChange({ ...value, period })}
          className="w-40"
        />

        {value.period === CUSTOM_PERIOD && (
          <DateRangeField
            label="Custom range"
            value={dateRange}
            onChange={onDateRangeChange}
            className="w-60"
          />
        )}

        <SelectField
          label="Compact pillar"
          value={value.pillar}
          options={filters.pillars}
          onChange={(pillar) => onChange({ ...value, pillar })}
          className="w-48"
        />

        <SelectField
          label="Institution"
          value={value.institution}
          options={filters.institutions}
          onChange={(institution) => onChange({ ...value, institution })}
          className="w-52"
        />

        <SelectField
          label="Priority"
          value={value.priority}
          options={filters.priorities}
          onChange={(priority) => onChange({ ...value, priority })}
          className="w-40"
        />

        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowMore((previous) => !previous)}
          aria-expanded={showMore}
          aria-controls="more-filters"
        >
          <SlidersHorizontal />
          More filters
        </Button>

        <div className="ml-auto text-right">
          <p className="text-xs font-medium text-text-muted">Last Updated</p>
          <p className="text-sm text-text-default">
            Data refreshed {formatRelativeTime(lastUpdated)}
          </p>
        </div>
      </div>

      {showMore && (
        <div
          id="more-filters"
          className="mt-3 flex flex-wrap items-end gap-3 border-t border-border-default pt-3"
        >
          <SelectField
            label="Geographic scope"
            value={value.geographicScope}
            options={filters.geographicScopes}
            onChange={(geographicScope) =>
              onChange({ ...value, geographicScope })
            }
            className="w-48"
          />

          <SelectField
            label="Distribution Company"
            value={value.distributionCompany}
            options={filters.distributionCompanies}
            onChange={(distributionCompany) =>
              onChange({ ...value, distributionCompany })
            }
            className="w-56"
          />

          <SelectField
            label="Technology or intervention"
            value={value.technology}
            options={filters.technologies}
            onChange={(technology) => onChange({ ...value, technology })}
            className="w-52"
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
