import { Search } from 'lucide-react'
import { useId } from 'react'
import type { StakeholdersQuery } from '@/api/schemas/stakeholders'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'
import type { StakeholderFilterOptions } from './types'

function AdvancedFields({
  options,
  query,
  onChange,
}: {
  readonly options: StakeholderFilterOptions
  readonly query: Required<StakeholdersQuery>
  readonly onChange: (query: Required<StakeholdersQuery>) => void
}) {
  const selects = [
    ['institutionType', 'Institution type', options.institutionTypes],
    ['role', 'Role in Mission 300', options.roles],
    ['status', 'Status', options.statuses],
    ['dataset', 'Dataset', options.datasets],
    ['kpi', 'Key performance indicator', options.kpis],
    ['programme', 'Programme', options.programmes],
    ['coverage', 'Coverage area', options.coverageAreas],
  ] as const

  return (
    <>
      {selects.map(([key, label, values]) => (
        <SelectField
          key={key}
          label={label}
          onChange={(value) => onChange({ ...query, [key]: value })}
          options={values}
          value={query[key]}
        />
      ))}
    </>
  )
}

export function StakeholderFilters({
  activeFilterCount,
  options,
  query,
  onChange,
  onReset,
}: {
  readonly activeFilterCount: number
  readonly options: StakeholderFilterOptions
  readonly query: Required<StakeholdersQuery>
  readonly onChange: (query: Required<StakeholdersQuery>) => void
  readonly onReset: () => void
}) {
  const searchId = useId()
  return (
    <div className="rounded-control bg-surface-sunken p-2.5 sm:p-3">
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor={searchId}>Search</label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
            <input
              className="h-9 w-full rounded-control border border-border-default bg-surface pl-9 pr-3 text-sm text-text-default placeholder:text-text-subtle"
              id={searchId}
              onChange={(event) => onChange({ ...query, search: event.target.value })}
              placeholder="Institution, dataset or programme"
              type="search"
              value={query.search}
            />
          </div>
        </div>
        <AdvancedFilterPopover activeCount={activeFilterCount} onReset={onReset} title="More filters">
          <AdvancedFields onChange={onChange} options={options} query={query} />
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
