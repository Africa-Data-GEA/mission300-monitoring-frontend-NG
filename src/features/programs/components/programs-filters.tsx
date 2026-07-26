import { Search } from 'lucide-react'
import { useId } from 'react'
import type { ProgramsFilterOptions, ProgramsQuery } from '@/api/schemas/programs'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'

/** This page's own three filters: search inline, the rest behind a
 * "More filters" disclosure. */
export function ProgramsFilters({
  options,
  value,
  activeFilterCount,
  onChange,
  onReset,
}: {
  options: ProgramsFilterOptions
  value: Required<ProgramsQuery>
  activeFilterCount: number
  onChange: (next: Required<ProgramsQuery>) => void
  onReset: () => void
}) {
  const searchId = useId()

  return (
    <div className="rounded-control bg-surface-sunken p-2.5 sm:p-3">
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor={searchId}>
            Search
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
            />
            <input
              className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
              id={searchId}
              onChange={(event) => onChange({ ...value, search: event.target.value })}
              placeholder="ID, name or institution"
              type="search"
              value={value.search}
            />
          </div>
        </div>

        <AdvancedFilterPopover activeCount={activeFilterCount} onReset={onReset} title="More filters">
          <SelectField
            label="Compact pillar"
            onChange={(next) => onChange({ ...value, pillar: next })}
            options={options.pillars}
            value={value.pillar}
          />
          <SelectField
            label="Institution"
            onChange={(next) => onChange({ ...value, institution: next })}
            options={options.institutions}
            value={value.institution}
          />
          <SelectField
            label="Status"
            onChange={(next) => onChange({ ...value, status: next })}
            options={options.statuses}
            value={value.status}
          />
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
