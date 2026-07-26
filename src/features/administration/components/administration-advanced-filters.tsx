import type {
  AdministrationFilterOptions,
  AdministrationQuery,
} from '@/api/schemas/administration'
import { SelectField } from '@/components/ui/select-field'

/** The seven secondary filters, shown inside the "More filters" disclosure. */
export function AdministrationAdvancedFilters({
  options,
  value,
  onChange,
}: {
  options: AdministrationFilterOptions
  value: Required<AdministrationQuery>
  onChange: (next: Required<AdministrationQuery>) => void
}) {
  return (
    <>
      <SelectField
        label="Institution"
        value={value.institution}
        options={options.institutions}
        onChange={(institution) => onChange({ ...value, institution })}
      />
      <SelectField
        label="System role"
        value={value.role}
        options={options.roles}
        onChange={(role) => onChange({ ...value, role })}
      />
      <SelectField
        label="Account status"
        value={value.accountStatus}
        options={options.accountStatuses}
        onChange={(accountStatus) => onChange({ ...value, accountStatus })}
      />
      <SelectField
        label="Permission"
        value={value.permission}
        options={options.permissions}
        onChange={(permission) => onChange({ ...value, permission })}
      />
      <SelectField
        label="Access scope"
        value={value.accessScope}
        options={options.accessScopes}
        onChange={(accessScope) => onChange({ ...value, accessScope })}
      />
      <SelectField
        label="Module"
        value={value.module}
        options={options.modules}
        onChange={(module) => onChange({ ...value, module })}
      />
      <SelectField
        label="Audit period"
        value={value.auditPeriod}
        options={options.auditPeriods}
        onChange={(auditPeriod) => onChange({ ...value, auditPeriod })}
      />
    </>
  )
}
