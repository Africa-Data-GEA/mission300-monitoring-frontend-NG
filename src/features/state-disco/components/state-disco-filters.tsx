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
   * `serviceBand` and `validationStatus` moved out of this shared bar
   * entirely — see the local filter controls inside each relevant section on
   * the page (Delivery & compliance, DisCo comparison, States). This page
   * merged five originally-separate tabs into one scroll, and neither field
   * applies to every one of them: Service band only ever meant anything on
   * the Delivery table, Validation status applies to three of the four data
   * tables but not Supply & tariff. Sitting in a page-wide bar, they looked
   * global but silently only touched one section — a reader changing Service
   * band would see Delivery narrow while DisCo comparison, sitting right
   * above it, didn't move, with no indication why.
   */
  const advanced = [
    ['view', 'View', options.views],
    ['state', 'State', options.states],
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

const DEFAULTS: Pick<Required<StateDiscoQuery>, 'view' | 'state'> = {
  view: 'disco', state: 'all',
}
