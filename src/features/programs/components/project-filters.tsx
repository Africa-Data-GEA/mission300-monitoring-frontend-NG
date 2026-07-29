import { Search } from 'lucide-react'
import { useId } from 'react'
import { EXECUTION_STATUSES, EXECUTION_STATUS_LABELS } from '@/api/schemas/programs'
import type { ProjectsQuery } from '@/api/schemas/programs'

/** Search and status filter for the projects table within a programme. */
export function ProjectFilters({
  value,
  onChange,
}: {
  value: Required<ProjectsQuery>
  onChange: (next: Required<ProjectsQuery>) => void
}) {
  const searchId = useId()
  const statusId = useId()

  return (
    <div className="flex flex-wrap items-end gap-2.5 rounded-control bg-surface-sunken p-2.5 sm:p-3">
      <div className="min-w-0 flex-1 sm:max-w-md">
        <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor={searchId}>
          Search
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
          />
          <input
            className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
            id={searchId}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="ID, owner or location"
            type="search"
            value={value.search}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted" htmlFor={statusId}>
          Status
        </label>
        <select
          id={statusId}
          className="h-9 rounded-control border border-border-default bg-surface px-3 text-sm text-text-default"
          onChange={(event) => onChange({ ...value, status: event.target.value })}
          value={value.status}
        >
          <option value="all">All statuses</option>
          {EXECUTION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {EXECUTION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
