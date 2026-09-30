import type {
  StateDiscoFilters,
  StateDiscoQuery,
} from '@/api/schemas/state-disco'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'
import { ALL_PERIODS, buildPeriod, parsePeriod, useYearAndQuarterOptions } from '../lib/period-filter'

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
  const { yearOptions, quartersByYear } = useYearAndQuarterOptions(options.reportingPeriods)
  const isAllPeriods = query.reportingPeriod === ALL_PERIODS
  const parsedPeriod = isAllPeriods ? null : parsePeriod(query.reportingPeriod)
  const selectedYear = parsedPeriod?.year ?? ALL_PERIODS
  const quartersForYear = quartersByYear.get(selectedYear) ?? []
  const selectedQuarter = parsedPeriod?.quarter ?? quartersForYear[0]?.value ?? ''

  // Picking a year keeps the current quarter only if that year actually has
  // it, otherwise falls back to that year's first available quarter -
  // matches the global filter bar's own Year/Quarter tie-together rule.
  function handleYearChange(year: string) {
    if (year === ALL_PERIODS) {
      onChange({ ...query, reportingPeriod: ALL_PERIODS })
      return
    }
    const quarters = quartersByYear.get(year) ?? []
    const nextQuarter = quarters.find((quarter) => quarter.value === selectedQuarter)?.value ?? quarters[0]?.value
    if (nextQuarter) onChange({ ...query, reportingPeriod: buildPeriod(year, nextQuarter as Parameters<typeof buildPeriod>[1]) })
  }

  function handleQuarterChange(quarter: string) {
    onChange({ ...query, reportingPeriod: buildPeriod(selectedYear, quarter as Parameters<typeof buildPeriod>[1]) })
  }

  const primary = [
    ['distributionCompany', 'Distribution Company', options.distributionCompanies],
  ] as const
  /*
   * Review's rule for this page was that a field offered as a filter must be
   * readable back from the table, "or remove it from the filter"
   * (docs/M300 Monitoring Platform Feedback.pptx, slide 11).
   *
   * `utilityMetric` and `source` are removed under that rule: neither exists
   * as a field on any row this page renders, so nothing could be filtered by
   * them and no column could show the result. They were inert controls. If
   * the underlying rows later carry a metric or a source, they belong here
   * again — with a matching column.
   *
   * `serviceBand` is absent while the Delivery section is hidden.
   * `validationStatus` belongs to DisCo comparison and stays in that section.
   */
  const advanced = [
    ['view', 'View', options.views],
    ['state', 'State', options.states],
  ] as const
  const activeCount = advanced.filter(([key]) => query[key] !== DEFAULTS[key]).length

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-control bg-surface-sunken p-3">
      <SelectField label="Year" value={selectedYear} options={yearOptions} onChange={handleYearChange} className="w-32" />
      {!isAllPeriods && (
        <SelectField label="Quarter" value={selectedQuarter} options={quartersForYear} onChange={handleQuarterChange} className="w-36" />
      )}
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

const DEFAULTS: Pick<Required<StateDiscoQuery>, 'view' | 'state'> = {
  view: 'disco', state: 'all',
}
