import { Search } from 'lucide-react'
import { useId } from 'react'
import type { ReportCategory } from '@/api/schemas/reports'
import { REPORT_CATEGORIES, REPORT_CATEGORY_LABELS } from '@/api/schemas/reports'
import { SelectField } from '@/components/ui/select-field'

/** Section E — the subset of the report filters that narrow Saved Reports:
 * report category and free-text search. The remaining Section E fields
 * (period, pillar, KPI category, state, DisCo, programme, validation
 * status, readiness tier, export format) are the Generate Report
 * configuration itself, applied per report rather than to this list. */
export function SavedReportsFilters({
  search,
  category,
  onChangeSearch,
  onChangeCategory,
}: {
  search: string
  category: string
  onChangeSearch: (value: string) => void
  onChangeCategory: (value: string) => void
}) {
  const searchId = useId()

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <div className="min-w-0 flex-1 sm:max-w-xs">
        <label htmlFor={searchId} className="mb-1.5 block text-xs font-medium text-text-muted">
          Search saved reports
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => onChangeSearch(event.target.value)}
            placeholder="Search by title, owner or file name"
            className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
          />
        </div>
      </div>

      <SelectField
        label="Category"
        value={category}
        options={[
          { value: 'all', label: 'All categories' },
          ...REPORT_CATEGORIES.map((entry: ReportCategory) => ({
            value: entry,
            label: REPORT_CATEGORY_LABELS[entry],
          })),
        ]}
        onChange={onChangeCategory}
        className="w-56"
      />
    </div>
  )
}
