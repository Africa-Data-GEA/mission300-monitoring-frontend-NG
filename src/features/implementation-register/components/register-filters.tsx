import { Search } from 'lucide-react'
import { useId } from 'react'
import type {
  ImplementationRegisterFilterOptions,
  ImplementationRegisterQuery,
} from '@/api/schemas/implementation-register'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { RegisterAdvancedFilters } from './register-advanced-filters'

/** This module's own ten filters: search inline, the rest behind a
 * "More filters" disclosure. */
export function RegisterFilters({
  options,
  value,
  activeFilterCount,
  onChange,
  onReset,
}: {
  options: ImplementationRegisterFilterOptions
  value: Required<ImplementationRegisterQuery>
  activeFilterCount: number
  onChange: (next: Required<ImplementationRegisterQuery>) => void
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
          <RegisterAdvancedFilters options={options} value={value} onChange={onChange} />
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
