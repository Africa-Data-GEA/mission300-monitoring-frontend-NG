import type {
  BottlenecksFilterOptions,
  BottlenecksQuery,
} from '@/api/schemas/bottlenecks'
import { SelectField } from '@/components/ui/select-field'

/** The nine secondary filters, shown inside the "More filters" disclosure. */
export function BottlenecksAdvancedFilters({
  options,
  value,
  onChange,
}: {
  options: BottlenecksFilterOptions
  value: Required<BottlenecksQuery>
  onChange: (next: Required<BottlenecksQuery>) => void
}) {
  const selects = [
    ['severity', 'Severity', options.severities],
    ['category', 'Category', options.categories],
    ['institution', 'Institution', options.institutions],
    ['pillar', 'Compact pillar', options.pillars],
    ['linkedRecord', 'Programme or project', options.linkedRecords],
    ['lifecycleStage', 'Lifecycle stage', options.lifecycleStages],
    ['escalationStatus', 'Escalation status', options.escalationStatuses],
    ['validationStatus', 'Validation status', options.validationStatuses],
    ['reportingPeriod', 'Reporting period', options.reportingPeriods],
  ] as const

  return (
    <>
      {selects.map(([key, label, values]) => (
        <SelectField
          key={key}
          label={label}
          onChange={(next) => onChange({ ...value, [key]: next })}
          options={values}
          value={value[key]}
        />
      ))}
    </>
  )
}
