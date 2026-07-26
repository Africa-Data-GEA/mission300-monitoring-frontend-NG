import type { StakeholdersQuery } from '@/api/schemas/stakeholders'
import { SelectField } from '@/components/ui/select-field'
import type { StakeholderFilterOptions } from './types'

/** The seven secondary filters, shown inside the "More filters" disclosure. */
export function StakeholderAdvancedFilters({
  options,
  query,
  onChange,
}: {
  options: StakeholderFilterOptions
  query: Required<StakeholdersQuery>
  onChange: (query: Required<StakeholdersQuery>) => void
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
