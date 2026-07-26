import type {
  StateDiscoFilters,
  StateDiscoQuery,
} from '@/api/schemas/state-disco'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'

export function StateDiscoFilterBar({
  options,
  query,
  onChange,
  onReset,
}: {
  options: StateDiscoFilters
  query: Required<StateDiscoQuery>
  onChange: (query: Required<StateDiscoQuery>) => void
  onReset: () => void
}) {
  const primary = [
    ['reportingPeriod', 'Reporting period', options.reportingPeriods],
    ['distributionCompany', 'Distribution Company', options.distributionCompanies],
  ] as const
  const advanced = [
    ['view', 'View', options.views],
    ['state', 'State', options.states],
    ['utilityMetric', 'Utility metric', options.utilityMetrics],
    ['serviceBand', 'Service band', options.serviceBands],
    ['validationStatus', 'Validation status', options.validationStatuses],
    ['source', 'Source', options.sources],
  ] as const
  const activeCount = advanced.filter(([key]) => query[key] !== DEFAULTS[key]).length

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-control bg-surface-sunken p-3">
      {primary.map(([key, label, values]) => (
        <SelectField key={key} label={label} value={query[key]} options={values} onChange={(value) => onChange({ ...query, [key]: value })} className="min-w-48" />
      ))}
      <AdvancedFilterPopover activeCount={activeCount} onReset={onReset} title="More filters">
        {advanced.map(([key, label, values]) => (
          <SelectField key={key} label={label} value={query[key]} options={values} onChange={(value) => onChange({ ...query, [key]: value })} />
        ))}
      </AdvancedFilterPopover>
    </div>
  )
}

const DEFAULTS: Pick<Required<StateDiscoQuery>, 'view' | 'state' | 'utilityMetric' | 'serviceBand' | 'validationStatus' | 'source'> = {
  view: 'disco', state: 'all', utilityMetric: 'all', serviceBand: 'all',
  validationStatus: 'confirmed', source: 'nerc',
}
