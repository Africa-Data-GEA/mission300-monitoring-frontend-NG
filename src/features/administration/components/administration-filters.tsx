import { Search } from 'lucide-react'
import { useId } from 'react'
import type {
  AdministrationFilterOptions,
  AdministrationQuery,
} from '@/api/schemas/administration'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'

interface AdministrationFiltersProps {
  options: AdministrationFilterOptions
  value: Required<AdministrationQuery>
  activeFilterCount: number
  onChange: (next: Required<AdministrationQuery>) => void
  onReset: () => void
}

function AdvancedFields({
  options,
  value,
  onChange,
}: Omit<AdministrationFiltersProps, 'activeFilterCount' | 'onReset'>) {
  return (
    <>
      <SelectField label="Institution" value={value.institution} options={options.institutions} onChange={(institution) => onChange({ ...value, institution })} />
      <SelectField label="System role" value={value.role} options={options.roles} onChange={(role) => onChange({ ...value, role })} />
      <SelectField label="Account status" value={value.accountStatus} options={options.accountStatuses} onChange={(accountStatus) => onChange({ ...value, accountStatus })} />
      <SelectField label="Permission" value={value.permission} options={options.permissions} onChange={(permission) => onChange({ ...value, permission })} />
      <SelectField label="Access scope" value={value.accessScope} options={options.accessScopes} onChange={(accessScope) => onChange({ ...value, accessScope })} />
      <SelectField label="Module" value={value.module} options={options.modules} onChange={(module) => onChange({ ...value, module })} />
      <SelectField label="Audit period" value={value.auditPeriod} options={options.auditPeriods} onChange={(auditPeriod) => onChange({ ...value, auditPeriod })} />
    </>
  )
}

export function AdministrationFilters(props: AdministrationFiltersProps) {
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
              onChange={(event) => props.onChange({ ...props.value, search: event.target.value })}
              placeholder="Name, email or institution"
              type="search"
              value={props.value.search}
            />
          </div>
        </div>
        <AdvancedFilterPopover
          activeCount={props.activeFilterCount}
          onReset={props.onReset}
          title="More filters"
        >
          <AdvancedFields options={props.options} value={props.value} onChange={props.onChange} />
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
