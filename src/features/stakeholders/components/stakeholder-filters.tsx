import { Search } from 'lucide-react'
import { useId } from 'react'
import type { StakeholdersQuery } from '@/api/schemas/stakeholders'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { StakeholderAdvancedFilters } from './stakeholder-advanced-filters'
import type { StakeholderFilterOptions } from './types'

/** This module's own filters: search inline, seven more behind a disclosure. */
export function StakeholderFilters({
  activeFilterCount,
  options,
  query,
  onChange,
  onReset,
}: {
  activeFilterCount: number
  options: StakeholderFilterOptions
  query: Required<StakeholdersQuery>
  onChange: (query: Required<StakeholdersQuery>) => void
  onReset: () => void
}) {
  const searchId = useId()

  return (
    <div className="rounded-control bg-surface-sunken p-2.5 sm:p-3">
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label
            className="mb-1.5 block text-xs font-medium text-text-muted"
            htmlFor={searchId}
          >
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
              onChange={(event) => onChange({ ...query, search: event.target.value })}
              placeholder="Institution, dataset or programme"
              type="search"
              value={query.search}
            />
          </div>
        </div>

        <AdvancedFilterPopover
          activeCount={activeFilterCount}
          onReset={onReset}
          title="More filters"
        >
          <StakeholderAdvancedFilters
            onChange={onChange}
            options={options}
            query={query}
          />
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
