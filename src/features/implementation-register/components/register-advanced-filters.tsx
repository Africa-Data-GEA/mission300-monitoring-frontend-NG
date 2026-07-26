import type {
  ImplementationRegisterFilterOptions,
  ImplementationRegisterQuery,
} from '@/api/schemas/implementation-register'
import { SelectField } from '@/components/ui/select-field'

/** The nine secondary filters, shown inside the "More filters" disclosure. */
export function RegisterAdvancedFilters({
  options,
  value,
  onChange,
}: {
  options: ImplementationRegisterFilterOptions
  value: Required<ImplementationRegisterQuery>
  onChange: (next: Required<ImplementationRegisterQuery>) => void
}) {
  const selects = [
    ['recordType', 'Record type', options.recordTypes],
    ['pillar', 'Compact pillar', options.pillars],
    ['institution', 'Institution', options.institutions],
    ['lifecycleStage', 'Lifecycle stage', options.lifecycleStages],
    ['executionStatus', 'Execution status', options.executionStatuses],
    ['priority', 'Priority', options.priorities],
    ['bottleneckCategory', 'Bottleneck category', options.bottleneckCategories],
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
