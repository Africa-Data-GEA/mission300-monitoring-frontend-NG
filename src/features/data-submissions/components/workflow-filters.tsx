import { Search } from 'lucide-react'
import { useId } from 'react'
import type {
  DataSubmissionFilters,
  DataSubmissionQuery,
} from '@/api/schemas/data-submissions'
import { AdvancedFilterPopover } from '@/components/ui/advanced-filter-popover'
import { SelectField } from '@/components/ui/select-field'

export function WorkflowFilters({
  options,
  query,
  onChange,
  onReset,
}: {
  options: DataSubmissionFilters
  query: Required<DataSubmissionQuery>
  onChange: (query: Required<DataSubmissionQuery>) => void
  onReset: () => void
}) {
  const searchId = useId()
  const fields = [
    ['institution', 'Institution', options.institutions],
    ['dataset', 'Dataset', options.datasets],
    ['reportingPeriod', 'Reporting period', options.reportingPeriods],
    ['submissionStatus', 'Submission status', options.submissionStatuses],
    ['validationStatus', 'Validation status', options.validationStatuses],
    ['reviewer', 'Reviewer', options.reviewers],
    ['readinessTier', 'Readiness tier', options.readinessTiers],
    ['overdueStatus', 'Overdue status', options.overdueStatuses],
  ] as const
  const activeCount = fields.filter(([key]) => query[key] !== 'all').length

  return (
    <div className="rounded-control bg-surface-sunken p-3">
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor={searchId}>Search</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle" />
            <input
              id={searchId}
              type="search"
              value={query.search}
              onChange={(event) => onChange({ ...query, search: event.target.value })}
              placeholder="Submission, institution or dataset"
              className="h-9 w-full rounded-control border border-border-default bg-surface pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        <AdvancedFilterPopover activeCount={activeCount} onReset={onReset} title="Filters">
          {fields.map(([key, label, values]) => (
            <SelectField
              key={key}
              label={label}
              value={query[key]}
              options={values}
              onChange={(value) => onChange({ ...query, [key]: value })}
            />
          ))}
        </AdvancedFilterPopover>
      </div>
    </div>
  )
}
