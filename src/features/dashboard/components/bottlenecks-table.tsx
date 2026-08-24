import { Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Pagination } from '@/components/ui/pagination'
import { SelectField } from '@/components/ui/select-field'
import { SeverityBadge } from '@/components/ui/status-badge'
import { SortableColumnHeader } from '@/components/ui/sortable-column-header'
import { cn } from '@/lib/utils'
import type { Bottleneck, BottleneckSeverity } from '../types'

const PAGE_SIZE = 8

/** Worst first, matching the register's own ranking. */
const SEVERITY_RANK: Record<BottleneckSeverity, number> = {
  critical: 0,
  blocked: 1,
  delayed: 2,
  regulatory: 3,
}

type SortKey = 'severity' | 'daysUnresolved' | 'institution' | 'category'

/**
 * Delivery bottlenecks and blockers.
 *
 * A table rather than the ranked five-row list this section used to be, with
 * search, per-column sorting and severity/category filters — review feedback
 * was that finding where delivery is blocked is a primary task, and that
 * "time unresolved" and the issue's definition were buried in a hover
 * popover when they are the two fields that decide whether a row matters
 * (docs/M300 Monitoring Platform Feedback.pptx, slide 4).
 */
export function BottlenecksTable({ exceptions }: { exceptions: readonly Bottleneck[] }) {
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')
  const [category, setCategory] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('severity')
  const [descending, setDescending] = useState(false)
  const [page, setPage] = useState(1)

  const categoryOptions = useMemo(() => {
    const unique = [...new Set(exceptions.map((row) => row.category))].sort()
    return [
      { value: 'all', label: 'All categories' },
      ...unique.map((value) => ({ value, label: value })),
    ]
  }, [exceptions])

  const severityOptions = useMemo(() => {
    const unique = [...new Set(exceptions.map((row) => row.severity))].sort(
      (a, b) => SEVERITY_RANK[a] - SEVERITY_RANK[b],
    )
    return [
      { value: 'all', label: 'All severities' },
      ...unique.map((value) => ({ value, label: value })),
    ]
  }, [exceptions])

  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()

    const filtered = exceptions.filter((row) => {
      if (severity !== 'all' && row.severity !== severity) return false
      if (category !== 'all' && row.category !== category) return false
      if (!query) return true

      return [row.title, row.category, row.institution, row.reference, row.followUp].some(
        (value) => value.toLocaleLowerCase().includes(query),
      )
    })

    const direction = descending ? -1 : 1
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'daysUnresolved':
          return (a.daysUnresolved - b.daysUnresolved) * direction
        case 'institution':
          return a.institution.localeCompare(b.institution) * direction
        case 'category':
          return a.category.localeCompare(b.category) * direction
        default:
          return (
            ((SEVERITY_RANK[a.severity] ?? 0) - (SEVERITY_RANK[b.severity] ?? 0) ||
              b.daysUnresolved - a.daysUnresolved) * direction
          )
      }
    })
  }, [exceptions, search, severity, category, sortKey, descending])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDescending((value) => !value)
      return
    }
    setSortKey(key)
    setDescending(false)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end gap-2.5 rounded-lg bg-surface-sunken p-3">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor={searchId} className="mb-1.5 block text-xs font-medium text-text-muted">
            Search bottlenecks
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
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Issue, institution or follow-up"
              className="h-9 w-full rounded-control border border-border-default bg-surface pr-3 pl-9 text-sm text-text-default placeholder:text-text-subtle"
            />
          </div>
        </div>

        <SelectField
          label="Severity"
          value={severity}
          options={severityOptions}
          onChange={(value) => {
            setSeverity(value)
            setPage(1)
          }}
          className="w-full sm:w-40"
        />

        <SelectField
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
          className="w-full sm:w-48"
        />

        <p aria-live="polite" className="pb-2 text-xs text-text-muted">
          {rows.length} of {exceptions.length} shown
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-default">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-surface-sunken text-xs font-medium text-text-muted">
            <tr>
              <th className="px-3 py-2.5">Issue</th>
              <SortableColumnHeader
                label="Category"
                active={sortKey === 'category'}
                descending={descending}
                onClick={() => toggleSort('category')}
              />
              <SortableColumnHeader
                label="Institution"
                active={sortKey === 'institution'}
                descending={descending}
                onClick={() => toggleSort('institution')}
              />
              <SortableColumnHeader
                label="Severity"
                active={sortKey === 'severity'}
                descending={descending}
                onClick={() => toggleSort('severity')}
              />
              <SortableColumnHeader
                label="Time unresolved"
                active={sortKey === 'daysUnresolved'}
                descending={descending}
                onClick={() => toggleSort('daysUnresolved')}
              />
              <th className="px-3 py-2.5">What it is / follow-up</th>
              <th className="px-3 py-2.5">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default bg-surface-card">
            {visible.map((row) => (
              <tr key={row.id} className="align-top hover:bg-surface-subtle">
                <td className="px-3 py-3 text-sm font-medium text-text-default">{row.title}</td>
                <td className="px-3 py-3 text-sm text-text-muted">{row.category}</td>
                <td className="px-3 py-3 text-sm text-text-muted">{row.institution}</td>
                <td className="px-3 py-3">
                  <SeverityBadge severity={row.severity} />
                </td>
                {/*
                  Tinted once a bottleneck has been open long enough to be the
                  story in its own right, so a scan down this column surfaces
                  the stale ones without reading every number.
                */}
                <td
                  className={cn(
                    'px-3 py-3 text-sm whitespace-nowrap',
                    row.daysUnresolved >= 60
                      ? 'font-medium text-status-at-risk'
                      : 'text-text-muted',
                  )}
                >
                  {row.daysUnresolved} days
                </td>
                <td className="px-3 py-3 text-sm text-text-muted">
                  <span className="line-clamp-2 max-w-[280px]" title={row.followUp || undefined}>
                    {row.followUp || '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-text-muted">{row.reference || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-muted">
          {exceptions.length === 0
            ? 'No unresolved delivery bottlenecks.'
            : 'No bottlenecks match the current filters.'}
        </p>
      ) : (
        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          total={rows.length}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
