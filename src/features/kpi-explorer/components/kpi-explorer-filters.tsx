import { Search } from 'lucide-react'
import { useId } from 'react'
import type {
  KpiExplorerFilterOptions,
  KpiExplorerQuery,
} from '@/api/schemas/kpi-explorer'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'

export type KpiFilterValues = Required<
  Omit<KpiExplorerQuery, 'page' | 'pageSize'>
>

interface Props {
  options: KpiExplorerFilterOptions
  value: KpiFilterValues
  activeFilterCount: number
  onChange: (next: KpiFilterValues) => void
  onReset: () => void
}

/**
 * Section E — the KPI Explorer's own filters.
 *
 * Search sits inline; the remaining seven go behind a "More filters"
 * disclosure so the bar stays compact. This module uses its own filters, not
 * the global dashboard set, so the route opts out of the global filter bar.
 */
export function KpiExplorerFilters({
  options,
  value,
  activeFilterCount,
  onChange,
  onReset,
}: Props) {
  const searchId = useId()

  return (
    <div className="rounded-control bg-surface p-2.5 sm:p-3">
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label
            htmlFor={searchId}
            className="mb-1.5 block text-xs font-medium text-text-muted"
          >
            Search
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
            />
            <input
              id={searchId}
              type="search"
              value={value.search}
              onChange={(event) =>
                onChange({ ...value, search: event.target.value })
              }
              placeholder="Search by identifier, name or source"
              className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
            />
          </div>
        </div>

        <AdvancedFilterPopover
          activeCount={activeFilterCount}
          onReset={onReset}
          title="More filters"
        >
          <SelectField
            label="Compact pillar"
            value={value.pillar}
            options={options.pillars}
            onChange={(pillar) => onChange({ ...value, pillar })}
          />
          <SelectField
            label="Category"
            value={value.category}
            options={options.categories}
            onChange={(category) => onChange({ ...value, category })}
          />
          <SelectField
            label="Readiness tier"
            value={value.readiness}
            options={options.readinessTiers}
            onChange={(readiness) => onChange({ ...value, readiness })}
          />
          <SelectField
            label="Validation status"
            value={value.validationStatus}
            options={options.validationStatuses}
            onChange={(validationStatus) =>
              onChange({ ...value, validationStatus })
            }
          />
          <SelectField
            label="Source institution"
            value={value.sourceInstitution}
            options={options.sourceInstitutions}
            onChange={(sourceInstitution) =>
              onChange({ ...value, sourceInstitution })
            }
          />
          <SelectField
            label="Reporting period"
            value={value.reportingPeriod}
            options={options.reportingPeriods}
            onChange={(reportingPeriod) =>
              onChange({ ...value, reportingPeriod })
            }
          />
          <SelectField
            label="Distribution Company or state"
            value={value.geography}
            options={options.geographies}
            onChange={(geography) => onChange({ ...value, geography })}
          />
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
